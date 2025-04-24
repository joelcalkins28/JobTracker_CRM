'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Loader2, Plus, Trash, Calendar as CalendarIcon, RefreshCw, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tooltip } from '@/components/ui/tooltip';

/**
 * EventManager component for managing calendar events for a job application
 * @param {Object} props - Component props
 * @param {string} props.applicationId - ID of the job application
 * @param {string} props.companyName - Name of the company for the job application
 * @param {string} props.jobTitle - Title of the job
 */
const EventManager = ({ applicationId, companyName, jobTitle }) => {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    eventType: 'interview',
    startDate: new Date(),
    startTime: '09:00',
    endDate: new Date(),
    endTime: '10:00',
    location: '',
    description: '',
  });

  /**
   * Fetches calendar events for the application from the API
   */
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar/events?applicationId=${applicationId}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new calendar event for the application
   */
  const createEvent = async (e) => {
    e.preventDefault();
    
    const startDateTime = new Date(formData.startDate);
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);
    
    const endDateTime = new Date(formData.endDate);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes);
    
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          type: formData.eventType,
          title: generateEventTitle(formData.eventType),
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          location: formData.location,
          description: formData.description,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create event');
      }
      
      toast.success('Calendar event created successfully');
      setShowForm(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create calendar event');
    }
  };

  /**
   * Generates a title for the event based on the event type and job details
   * @param {string} eventType - Type of the event
   * @returns {string} Generated event title
   */
  const generateEventTitle = (eventType) => {
    switch (eventType.toLowerCase()) {
      case 'interview':
        return `Interview: ${companyName} - ${jobTitle}`;
      case 'phone screen':
        return `Phone Screen: ${companyName} - ${jobTitle}`;
      case 'technical':
        return `Technical Interview: ${companyName} - ${jobTitle}`;
      case 'follow-up':
        return `Follow-up: ${companyName} - ${jobTitle}`;
      case 'offer':
        return `Offer Discussion: ${companyName} - ${jobTitle}`;
      default:
        return `${eventType}: ${companyName} - ${jobTitle}`;
    }
  };

  /**
   * Deletes a calendar event
   * @param {string} eventId - ID of the event to delete
   */
  const deleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const response = await fetch(`/api/calendar/events?id=${eventId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete event');
      
      toast.success('Calendar event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete calendar event');
    }
  };

  /**
   * Syncs events with Google Calendar
   */
  const syncWithGoogleCalendar = async () => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to sync with Google Calendar');
      return;
    }
    
    setSyncing(true);
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          applicationId: applicationId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sync with Google Calendar');
      }
      
      toast.success('Successfully synced with Google Calendar');
      fetchEvents(); // Refresh events to show Google Calendar IDs
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      toast.error(error.message || 'Failed to sync with Google Calendar');
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Resets the form data to default values
   */
  const resetForm = () => {
    setFormData({
      eventType: 'interview',
      startDate: new Date(),
      startTime: '09:00',
      endDate: new Date(),
      endTime: '10:00',
      location: '',
      description: '',
    });
  };

  /**
   * Formats a date and time for display
   * @param {string} dateStr - ISO date string
   * @returns {string} Formatted date and time
   */
  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  /**
   * Returns a badge variant based on event type
   * @param {string} eventType - Type of the event
   * @returns {string} Badge variant
   */
  const getEventTypeBadge = (eventType) => {
    switch (eventType?.toLowerCase()) {
      case 'interview':
        return 'destructive';
      case 'phone screen':
        return 'secondary';
      case 'follow-up':
        return 'outline';
      case 'technical':
        return 'default';
      case 'offer':
        return 'success';
      default:
        return 'default';
    }
  };

  /**
   * Creates a Google Calendar URL for an event
   * @param {Object} event - Calendar event object
   * @returns {string|null} Google Calendar URL or null if not synced
   */
  const getGoogleCalendarUrl = (event) => {
    if (!event.calendarEventId || !event.calendarId) return null;
    
    return `https://calendar.google.com/calendar/event?eid=${event.calendarEventId}&ctz=local`;
  };

  // Load events when component mounts
  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [session, applicationId]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Calendar Events</CardTitle>
        <div className="flex space-x-2">
          <Tooltip content="Sync with Google Calendar">
            <Button
              onClick={syncWithGoogleCalendar}
              size="sm"
              variant="outline"
              disabled={syncing || !session}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", syncing && "animate-spin")} />
              {syncing ? "Syncing..." : "Sync with Google"}
            </Button>
          </Tooltip>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            variant="outline"
          >
            {showForm ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add Event</>}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={createEvent} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="phone screen">Phone Screen</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="technical">Technical Interview</SelectItem>
                    <SelectItem value="offer">Offer Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="In-person or virtual link"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({ ...formData, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details about the event"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Event</Button>
            </div>
          </form>
        )}
        
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge variant={getEventTypeBadge(event.eventType)}>
                        {event.eventType}
                      </Badge>
                      {event.calendarEventId && (
                        <Badge variant="outline" className="bg-blue-50">
                          Google Calendar
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateTime(event.startTime)} - {formatDateTime(event.endTime)}
                    </p>
                    {event.location && (
                      <p className="text-sm mt-1">📍 {event.location}</p>
                    )}
                    {event.description && (
                      <p className="text-sm mt-2">{event.description}</p>
                    )}
                    {getGoogleCalendarUrl(event) && (
                      <a
                        href={getGoogleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View in Google Calendar
                      </a>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEvent(event.id)}
                    className="text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No calendar events found for this application.
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                variant="link"
                className="ml-1"
              >
                Add one?
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventManager; 