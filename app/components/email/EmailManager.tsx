'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Divider, 
  FormControl, 
  Grid, 
  IconButton, 
  InputLabel, 
  List, 
  ListItem, 
  ListItemText, 
  MenuItem, 
  OutlinedInput, 
  Paper, 
  Select, 
  TextField, 
  Typography 
} from '@mui/material';
import { Send as SendIcon, Refresh as RefreshIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useToast } from 'app/hooks/useToast';

/**
 * EmailManager component for managing emails
 * Allows users to view, send, and manage emails related to job applications
 * @param {Object} props - Component props
 * @param {string} props.applicationId - Optional job application ID to filter emails
 */
export default function EmailManager({ applicationId }: { applicationId?: string }) {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [emailLabels, setEmailLabels] = useState<any[]>([]);
  const [selectedLabel, setSelectedLabel] = useState('INBOX');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New email form state
  const [showComposeForm, setShowComposeForm] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  
  const router = useRouter();
  const { showToast } = useToast();

  /**
   * Fetch emails based on current filters
   */
  const fetchEmails = async () => {
    try {
      setLoading(true);
      
      let query = `?labelIds=${selectedLabel}`;
      if (searchQuery) query += `&q=${encodeURIComponent(searchQuery)}`;
      if (nextPageToken) query += `&pageToken=${nextPageToken}`;
      if (applicationId) query += `&q=job application ${applicationId}`;
      
      const response = await fetch(`/api/emails${query}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      
      const data = await response.json();
      setEmails(data.messages || []);
      setNextPageToken(data.nextPageToken || null);
    } catch (error) {
      console.error('Error fetching emails:', error);
      showToast('Failed to fetch emails', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch available Gmail labels
   */
  const fetchLabels = async () => {
    try {
      const response = await fetch('/api/emails/labels');
      
      if (!response.ok) {
        throw new Error('Failed to fetch labels');
      }
      
      const data = await response.json();
      setEmailLabels(data.labels || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
      showToast('Failed to fetch email labels', 'error');
    }
  };

  /**
   * Load email details when an email is selected
   * @param {string} emailId - ID of the selected email
   */
  const loadEmailDetails = async (emailId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/emails?id=${emailId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch email details');
      }
      
      const data = await response.json();
      setSelectedEmail(data);
    } catch (error) {
      console.error('Error loading email details:', error);
      showToast('Failed to load email details', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send a new email
   */
  const sendNewEmail = async () => {
    if (!to || !subject) {
      showToast('Recipient and subject are required', 'error');
      return;
    }
    
    try {
      setSending(true);
      
      const emailData = {
        to,
        subject,
        body,
        isHtml: false,
      };
      
      if (applicationId) {
        Object.assign(emailData, { applicationId });
      }
      
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      showToast('Email sent successfully', 'success');
      // Reset form
      setTo('');
      setSubject('');
      setBody('');
      setShowComposeForm(false);
      // Refresh emails
      fetchEmails();
    } catch (error) {
      console.error('Error sending email:', error);
      showToast('Failed to send email', 'error');
    } finally {
      setSending(false);
    }
  };

  // Load emails and labels on mount
  useEffect(() => {
    fetchEmails();
    fetchLabels();
  }, [applicationId]);

  // Refresh emails when label or search changes
  useEffect(() => {
    fetchEmails();
  }, [selectedLabel, searchQuery]);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Email Management
        <IconButton onClick={fetchEmails} disabled={loading} size="small" sx={{ ml: 1 }}>
          <RefreshIcon />
        </IconButton>
      </Typography>

      {/* Email filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Label</InputLabel>
                <Select
                  value={selectedLabel}
                  onChange={(e) => setSelectedLabel(e.target.value)}
                  label="Label"
                >
                  {emailLabels.map((label) => (
                    <MenuItem key={label.id} value={label.id}>
                      {label.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search emails"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => setShowComposeForm(true)}
                fullWidth
              >
                Compose Email
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Email compose form */}
      {showComposeForm && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              New Email
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="To"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={sendNewEmail}
                  disabled={sending}
                  startIcon={sending ? <CircularProgress size={24} /> : <SendIcon />}
                >
                  {sending ? 'Sending...' : 'Send Email'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowComposeForm(false)}
                  sx={{ ml: 1 }}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Email list and detail view */}
      <Grid container spacing={2}>
        {/* Email list */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ maxHeight: 600, overflow: 'auto' }}>
            {loading && !emails.length ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <List dense>
                {emails.length > 0 ? (
                  emails.map((email) => (
                    <ListItem
                      key={email.id}
                      button
                      onClick={() => loadEmailDetails(email.id)}
                      selected={selectedEmail?.id === email.id}
                      divider
                    >
                      <ListItemText
                        primary={email.snippet || 'No subject'}
                        secondary={email.from || 'Unknown sender'}
                        primaryTypographyProps={{
                          noWrap: true,
                          fontWeight: email.unread ? 'bold' : 'normal',
                        }}
                        secondaryTypographyProps={{
                          noWrap: true,
                        }}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No emails found" />
                  </ListItem>
                )}
                {nextPageToken && (
                  <ListItem>
                    <Button
                      fullWidth
                      variant="text"
                      onClick={fetchEmails}
                      disabled={loading}
                    >
                      Load More
                    </Button>
                  </ListItem>
                )}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Email detail view */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, minHeight: 400, maxHeight: 600, overflow: 'auto' }}>
            {selectedEmail ? (
              <>
                <Typography variant="h6">{selectedEmail.subject || 'No subject'}</Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  From: {selectedEmail.from || 'Unknown'}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  To: {selectedEmail.to || 'Unknown'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body || 'No content' }}
                />
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SendIcon />}
                    onClick={() => {
                      setTo(selectedEmail.from || '');
                      setSubject(`Re: ${selectedEmail.subject || ''}`.replace(/^Re: Re: /, 'Re: '));
                      setShowComposeForm(true);
                    }}
                  >
                    Reply
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="textSecondary">
                  Select an email to view its contents
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 