import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Paper } from "@/utils/paper";

import { Typography } from "@/utils/typography";
import Container from "@mui/material/Container";
import Upgrade from "@mui/icons-material/Upgrade";
import { Download } from "lucide-react";

interface UpgradePromptProps {
  maxListings: number;
  currentListings: number;
  onUpgrade?: () => void;
}

export const UpgradePrompt = ({
  maxListings,
  currentListings,
  onUpgrade,
}: UpgradePromptProps) => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box textAlign="center" py={4}>
            <Upgrade color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {currentListings >= maxListings
                ? "You've Reached Your Listing Limit!"
                : "Upgrade Your Account"}
            </Typography>

            <Typography color="text.secondary" paragraph>
              {currentListings >= maxListings
                ? `You've used all ${maxListings} of your available listings.`
                : `You've used ${currentListings} of ${maxListings} available listings.`}
            </Typography>

            <Box mt={4} mb={3}>
              <Typography variant="h6" gutterBottom>
                Get More Listings
              </Typography>
              <Typography color="text.secondary" paragraph>
                Upgrade to a premium or business account to create more listings
                and unlock additional features.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Upgrade />}
                onClick={onUpgrade}
                sx={{ mt: 2, mr: 2 }}
              >
                Upgrade Account
              </Button>
            </Box>

            <Box mt={4} pt={3} borderTop={1} borderColor="divider">
              <Typography variant="h6" gutterBottom>
                Or Use Our Mobile App
              </Typography>
              <Typography color="text.secondary" paragraph>
                Download our mobile app to manage your listings on the go and
                get exclusive mobile-only features.
              </Typography>

              <Box display="flex" justifyContent="center" gap={2} mt={2}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Download />}
                  onClick={() =>
                    window.open("https://play.google.com/store/apps", "_blank")
                  }
                >
                  Google Play
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Download />}
                  onClick={() =>
                    window.open("https://apps.apple.com", "_blank")
                  }
                >
                  App Store
                </Button>
              </Box>
            </Box>
          </Box>
      </Paper>
    </Container>
  );
};

export default UpgradePrompt;
