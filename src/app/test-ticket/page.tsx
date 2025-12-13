"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTestTicket } from "@/features/ticket/actions/create-test-ticket";

export default function TicketTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);

      // Log what we're submitting
      console.log("Submitting form with categoryId:", categoryId);
      console.log("Form data categoryId:", formData.get("categoryId"));

      // Add the categoryId explicitly based on our state
      if (categoryId === null) {
        // Use explicitly null (not an empty string)
        formData.set("categoryIdType", "null");
      } else if (categoryId === "") {
        // Use empty string
        formData.set("categoryIdType", "emptyString");
      } else {
        // Use the actual value
        formData.set("categoryIdType", "validId");
      }

      const response = await createTestTicket(formData);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Ticket Creation Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Test Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="testForm" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Title</label>
                <Input name="title" required placeholder="Ticket title" />
              </div>

              <div>
                <label className="block mb-2">Content</label>
                <Textarea
                  name="content"
                  required
                  placeholder="Ticket content"
                />
              </div>

              <div>
                <label className="block mb-2">Category Selection Type</label>
                <Select
                  onValueChange={(value) => {
                    if (value === "null") {
                      setCategoryId(null);
                    } else if (value === "empty") {
                      setCategoryId("");
                    } else {
                      setCategoryId(value);
                    }
                  }}
                  defaultValue="null"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select categoryId type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">NULL value</SelectItem>
                    <SelectItem value="empty">Empty string</SelectItem>
                    <SelectItem value="1">Valid ID (1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hidden input for categoryId */}
              <input
                type="hidden"
                name="categoryId"
                value={categoryId === null ? "" : categoryId}
              />
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" form="testForm" disabled={loading}>
              {loading ? "Creating..." : "Create Test Ticket"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <pre className="bg-secondary/20 p-4 rounded-md overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">
                Submit the form to see results
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
