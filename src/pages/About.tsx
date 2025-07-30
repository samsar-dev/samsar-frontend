import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { styled } from '@mui/material/styles';
import React, { Suspense, lazy } from 'react';
const MotionDiv = lazy(() => import('framer-motion').then(mod => ({ default: mod.motion.div })));
import { useTranslation } from 'react-i18next';
import { SEO } from '@/utils/seo';
import { Typography } from '@/utils/typography';

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
    <Box sx={{ py: 8, bgcolor: 'background.default' }} dir="rtl">
      <SEO 
        title={t('about_page.meta_title', 'من نحن - سمسار')}
        description={t('about_page.meta_description', 'تعرف على منصة سمسار الرائدة في بيع وشراء السيارات والعقارات في سوريا. مهمتنا ورؤيتنا وقيمنا')}
        keywords={t('about_page.meta_keywords', 'من نحن, عن سمسار, منصة سمسار, فريق سمسار, رؤيتنا, مهمتنا, قيمنا')}
      />
      <Container maxWidth="lg">
        <Suspense fallback={null}>
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h1" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, mb: 4, fontSize: { xs: '2rem', md: '2.5rem' } }}>
            {t('about_page.title', 'من نحن')}
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph align="center" sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}>
            {t('about_page.subtitle')}
          </Typography>
        </MotionDiv>
        </Suspense>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          {features.map((feature, index) => (
            <StyledCard key={index}>
              <CardContent>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" paragraph>
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