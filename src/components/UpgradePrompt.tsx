import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/utils/typography";
import { ArrowUpCircle, Download } from "lucide-react";

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
    <div className="max-w-2xl mx-auto mt-8">
      <Card className="p-6">
        <div className="text-center py-8">
          <ArrowUpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <Typography variant="h5" className="mb-4">
            {currentListings >= maxListings
              ? "You've Reached Your Listing Limit!"
              : "Upgrade Your Account"}
          </Typography>

          <Typography className="text-muted-foreground mb-6">
            {currentListings >= maxListings
              ? `You've used all ${maxListings} of your available listings.`
              : `You've used ${currentListings} of ${maxListings} available listings.`}
          </Typography>

          <div className="my-6 mb-8">
            <Typography variant="h6" className="mb-4">
              Get More Listings
            </Typography>
            <Typography className="text-muted-foreground mb-6">
              Upgrade to a premium or business account to create more listings
              and unlock additional features.
            </Typography>

            <Button size="lg" onClick={onUpgrade} className="mt-4 mr-4">
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Upgrade Account
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Typography variant="h6" className="mb-4">
              Or Use Our Mobile App
            </Typography>
            <Typography className="text-muted-foreground mb-6">
              Download our mobile app to manage your listings on the go and get
              exclusive mobile-only features.
            </Typography>

            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  window.open("https://play.google.com/store/apps", "_blank")
                }
              >
                <Download className="w-4 h-4 mr-2" />
                Google Play
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open("https://apps.apple.com", "_blank")}
              >
                <Download className="w-4 h-4 mr-2" />
                App Store
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UpgradePrompt;
