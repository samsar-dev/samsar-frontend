import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Listing, Location, ListingUpdateInput } from "@/types/listings";
import { listingsAPI } from "@/api/listings.api";
import FormField from "@/components/listings/create/common/FormField";
import { Button } from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-toastify";

interface EditFormData {
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

const EditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    title: "",
    description: "",
    price: 0,
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (!id) return;
        const response = await listingsAPI.getListing(id);
        if (response.success && response.data) {
          setListing(response.data);
          setFormData({
            title: response.data.title,
            description: response.data.description,
            price: response.data.price,
            location: response.data.location as unknown as Location,
          });
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast.error("Failed to fetch listing details");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !listing) return;

    try {
      setSaving(true);
      const updateData: ListingUpdateInput = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: listing.category,
        location: `${formData.location.city}, ${formData.location.state}, ${formData.location.country}`,
      };

      await listingsAPI.updateListing(id, updateData);
      toast.success("Listing updated successfully");
      navigate(`/listings/${id}`);
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800">Listing not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Listing</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="space-y-6">
          <FormField
            label="Title"
            name="title"
            type="text"
            value={formData.title}
            onChange={(value: string | number | boolean | string[]) =>
              setFormData({ ...formData, title: value as string })
            }
            required
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(value: string | number | boolean | string[]) =>
              setFormData({ ...formData, description: value as string })
            }
            required
          />

          <FormField
            label="Price"
            name="price"
            type="number"
            value={formData.price.toString()}
            onChange={(value: string | number | boolean | string[]) =>
              setFormData({
                ...formData,
                price: parseFloat(value as string) || 0,
              })
            }
            required
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location</h3>
            <FormField
              label="Address"
              name="address"
              type="text"
              value={formData.location.address}
              onChange={(value: string | number | boolean | string[]) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, address: value as string },
                })
              }
              required
            />

            <FormField
              label="City"
              name="city"
              type="text"
              value={formData.location.city}
              onChange={(value: string | number | boolean | string[]) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, city: value as string },
                })
              }
              required
            />

            <FormField
              label="State"
              name="state"
              type="text"
              value={formData.location.state}
              onChange={(value: string | number | boolean | string[]) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, state: value as string },
                })
              }
              required
            />

            <FormField
              label="Country"
              name="country"
              type="text"
              value={formData.location.country}
              onChange={(value: string | number | boolean | string[]) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, country: value as string },
                })
              }
              required
            />

            <FormField
              label="Postal Code"
              name="postalCode"
              type="text"
              value={formData.location.postalCode}
              onChange={(value: string | number | boolean | string[]) =>
                setFormData({
                  ...formData,
                  location: {
                    ...formData.location,
                    postalCode: value as string,
                  },
                })
              }
              required
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/listings/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditListing;
