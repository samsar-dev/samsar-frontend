import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { SEO } from "@/utils/seo";
import { Typography } from "@/utils/typography";

const StyledCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Card
    className={cn(
      "h-full flex flex-col transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg",
      className,
    )}
  >
    {children}
  </Card>
);

const About = () => {
  const { t } = useTranslation("footer");

  const features = [
    {
      title: t("about_page.features.mission.title"),
      description: t("about_page.features.mission.description"),
    },
    {
      title: t("about_page.features.trust.title"),
      description: t("about_page.features.trust.description"),
    },
    {
      title: t("about_page.features.selection.title"),
      description: t("about_page.features.selection.description"),
    },
    {
      title: t("about_page.features.support.title"),
      description: t("about_page.features.support.description"),
    },
  ];

  return (
    <div className="py-8 bg-background" dir="rtl">
      <SEO
        title={t("about_page.meta_title", "من نحن - سمسار")}
        description={t(
          "about_page.meta_description",
          "تعرف على منصة سمسار الرائدة في بيع وشراء السيارات والعقارات في سوريا. مهمتنا ورؤيتنا وقيمنا",
        )}
        keywords={t(
          "about_page.meta_keywords",
          "من نحن, عن سمسار, منصة سمسار, فريق سمسار, رؤيتنا, مهمتنا, قيمنا",
        )}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fadeInUp">
          <Typography
            variant="h1"
            component="h1"
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            {t("about_page.title", "من نحن")}
          </Typography>
          <Typography
            variant="h5"
            className="text-muted-foreground text-center mb-8 max-w-3xl mx-auto"
          >
            {t("about_page.subtitle")}
          </Typography>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <StyledCard key={index}>
              <CardContent className="p-6">
                <Typography
                  variant="h4"
                  component="h3"
                  className="text-xl font-semibold mb-2"
                >
                  {feature.title}
                </Typography>
                <Typography className="text-muted-foreground">
                  {feature.description}
                </Typography>
              </CardContent>
            </StyledCard>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Typography
            variant="h4"
            component="h2"
            className="text-2xl font-semibold mb-4"
          >
            {t("about_page.story.title")}
          </Typography>
          <Typography className="text-muted-foreground max-w-3xl mx-auto">
            {t("about_page.story.content")}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default About;
