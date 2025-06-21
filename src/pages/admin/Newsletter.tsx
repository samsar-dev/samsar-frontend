import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress, 
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Container,
  Grid as MuiGrid
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Move styled components outside the component to prevent re-renders
const Grid = styled(MuiGrid)({});
const GridItem = styled(MuiGrid)({});

import { 
  Send as SendIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Code as CodeIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { sendNewsletter, getNewsletterStats } from '@/services/newsletterService';
import { NewsletterFormData } from '@/types/newsletter';

const Newsletter = () => {
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    lastSent: null as string | null
  });
  const [preview, setPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isHtml, setIsHtml] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch,
    formState: { errors } 
  } = useForm<NewsletterFormData>({
    defaultValues: {
      subject: '',
      content: '',
      isHtml: false,
      template: 'default'
    }
  });

  const content = watch('content');
  const subject = watch('subject');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getNewsletterStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load newsletter stats:', error);
        toast.error('Failed to load newsletter statistics');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    if (showPreview) {
      setPreview(content);
    }
  }, [content, showPreview]);

  const onSubmit = async (data: NewsletterFormData) => {
    if (!window.confirm(`Are you sure you want to send this newsletter to ${stats.totalSubscribers} subscribers?`)) {
      return;
    }

    try {
      setIsSending(true);
      
      const response = await sendNewsletter({
        ...data,
        isHtml
      });

      if (response.success) {
        toast.success(`Newsletter sent successfully to ${response.data?.sentCount || 0} subscribers`);
        if (response.data?.failedCount) {
          toast.warning(`Failed to send to ${response.data.failedCount} subscribers`);
        }
        reset();
        // Refresh stats after sending
        const updatedStats = await getNewsletterStats();
        setStats(updatedStats);
      } else {
        throw new Error(response.message || 'Failed to send newsletter');
      }
    } catch (error: any) {
      console.error('Error sending newsletter:', error);
      toast.error(error.message || 'Failed to send newsletter');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <GridItem xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h1" gutterBottom>
                Send Newsletter
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Subject"
                  variant="outlined"
                  margin="normal"
                  {...register('subject', { required: 'Subject is required' })}
                  error={!!errors.subject}
                  helperText={errors.subject?.message}
                />
                
                <TextField
                  fullWidth
                  label="Content"
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={10}
                  {...register('content', { 
                    required: 'Content is required',
                    minLength: { value: 10, message: 'Content should be at least 10 characters long' }
                  })}
                  error={!!errors.content}
                  helperText={errors.content?.message}
                  sx={{ mt: 2 }}
                />
                
                <FormGroup sx={{ mb: 2 }}>
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={isHtml} 
                        onChange={(e) => setIsHtml(e.target.checked)}
                        color="primary"
                      />
                    } 
                    label="HTML Content"
                  />
                  <FormHelperText>
                    Toggle to switch between plain text and HTML content
                  </FormHelperText>
                </FormGroup>

                <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'space-between' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setShowPreview(!showPreview)}
                    startIcon={<PreviewIcon />}
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to discard this draft?')) {
                          reset();
                        }
                      }}
                      disabled={isSending}
                    >
                      Discard
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSending}
                      startIcon={isSending ? <CircularProgress size={20} /> : <SendIcon />}
                    >
                      {isSending ? 'Sending...' : `Send to ${stats.totalSubscribers} Users`}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {showPreview && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Preview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    borderRadius: 1,
                    minHeight: 200,
                    bgcolor: 'background.paper',
                    whiteSpace: 'pre-wrap',
                    ...(isHtml && { 
                      '& *': { all: 'revert' },
                      '&': { 
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '16px',
                        lineHeight: 1.5
                      }
                    })
                  }}
                  dangerouslySetInnerHTML={{ __html: isHtml ? preview : preview.replace(/\n/g, '<br>') }}
                />
              </CardContent>
            </Card>
          )}
        </GridItem>

        <GridItem xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Newsletter Stats
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                  <Typography variant="h6">
                    {stats.totalSubscribers.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Sent
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(stats.lastSent)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" gutterBottom>
                Tips for effective newsletters:
              </Typography>
              <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
                <li>Keep subject lines clear and engaging</li>
                <li>Use a friendly, conversational tone</li>
                <li>Include a clear call-to-action</li>
                <li>Ensure mobile-friendly content</li>
                <li>Test before sending to all users</li>
              </ul>
              
              {isHtml && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="warning.contrastText">
                    <CodeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    HTML Mode: Make sure your HTML is properly formatted and tested.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Newsletter;
