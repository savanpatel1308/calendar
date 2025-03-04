import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Dashboard.css";

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [location, setLocation] = useState("");
    const [editingEvent, setEditingEvent] = useState(null);
    const [reminderMessage, setReminderMessage] = useState("");
    const [reminderTime, setReminderTime] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        axios.get("http://localhost:3000/events", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setEvents(response.data))
        .catch(error => console.error("Error fetching events:", error));

        axios.get("http://localhost:3000/reminders", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setReminders(response.data))
        .catch(error => console.error("Error fetching reminders:", error));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token"); // Remove JWT token
        navigate("/"); // Redirect to login page
    };

    const handleCreateOrUpdateEvent = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            if (editingEvent) {
                await axios.put(`http://localhost:3000/events/${editingEvent.id}`, {
                    title, description, date_time: dateTime, location
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setEvents(events.map(event => event.id === editingEvent.id ? { ...event, title, description, date_time: dateTime, location } : event));
                setEditingEvent(null);
            } else {
                const response = await axios.post("http://localhost:3000/events", {
                    title, description, date_time: dateTime, location
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setEvents([...events, response.data]);
            }

            setTitle("");
            setDescription("");
            setDateTime("");
            setLocation("");

        } catch (error) {
            console.error("Error processing event:", error);
        }
    };

    const handleEdit = (event) => {
        setTitle(event.title);
        setDescription(event.description);
        setDateTime(event.date_time);
        setLocation(event.location);
        setEditingEvent(event);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem("token");

        if (!window.confirm("Are you sure you want to delete this event?")) return;

        try {
            await axios.delete(`http://localhost:3000/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setEvents(events.filter(event => event.id !== id));
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const handleAddReminder = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        if (!selectedEvent) {
            alert("Please select an event for the reminder.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/reminders", {
                event_id: selectedEvent,
                message: reminderMessage,
                reminder_time: reminderTime
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Reminder added successfully!");
            setReminders([...reminders, { ...response.data, event_id: selectedEvent }]);
            setReminderMessage("");
            setReminderTime("");
        } catch (error) {
            console.error("Error adding reminder:", error);
        }
    };

    const handleDeleteReminder = async (id) => {
        const token = localStorage.getItem("token");

        if (!window.confirm("Are you sure you want to delete this reminder?")) return;

        try {
            await axios.delete(`http://localhost:3000/reminders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReminders(reminders.filter(reminder => reminder.id !== id));
        } catch (error) {
            console.error("Error deleting reminder:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>
            
            {/* Logout Button */}
            <button className="logout-btn" onClick={handleLogout}>Logout</button>

            <h3>{editingEvent ? "Edit Event" : "Create a New Event"}:</h3>
            <form onSubmit={handleCreateOrUpdateEvent}>
                <input type="text" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} required />
                <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                <button type="submit">{editingEvent ? "Update Event" : "Create Event"}</button>
                {editingEvent && <button onClick={() => setEditingEvent(null)}>Cancel</button>}
            </form>

            <h3>Your Events:</h3>
            <ul className="event-list">
                {events.map(event => (
                    <li key={event.id} className="event-item">
                        <strong>{event.title}</strong> - {event.date_time} - {event.location}
                        <div className="event-actions">
                            <button className="edit-btn" onClick={() => handleEdit(event)}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(event.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>

            <h3>Add a Reminder:</h3>
            <form onSubmit={handleAddReminder}>
                <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} required>
                    <option value="">Select Event</option>
                    {events.map(event => (
                        <option key={event.id} value={event.id}>{event.title}</option>
                    ))}
                </select>
                <input type="text" placeholder="Reminder Message" value={reminderMessage} onChange={(e) => setReminderMessage(e.target.value)} required />
                <input type="datetime-local" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} required />
                <button type="submit">Add Reminder</button>
            </form>

            <h3>Your Reminders:</h3>
            <ul>
                {reminders.map(reminder => (
                    <li key={reminder.id}>
                        {reminder.message} - {reminder.reminder_time}
                        <button className="delete-btn" onClick={() => handleDeleteReminder(reminder.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
