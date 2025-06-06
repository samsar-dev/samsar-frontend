import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const About = () => {
  const { t } = useTranslation('footer');
  
  const features = [
    {
      title: t('about_page.features.mission.title'),
      description: t('about_page.features.mission.description')
    },
    {
      title: t('about_page.features.trust.title'),
      description: t('about_page.features.trust.description')
    },
    {
      title: t('about_page.features.selection.title'),
      description: t('about_page.features.selection.description')
    },
    {
      title: t('about_page.features.support.title'),
      description: t('about_page.features.support.description')
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, mb: 4 }}>
            {t('about_page.title')}
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph align="center" sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}>
            {t('about_page.subtitle')}
          </Typography>
        </motion.div>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          {features.map((feature, index) => (
            <StyledCard key={index}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </StyledCard>
          ))}
        </Box>

        <Box sx={{ mt: 12, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
            {t('about_page.story.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}>
            {t('about_page.story.content')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default About;
