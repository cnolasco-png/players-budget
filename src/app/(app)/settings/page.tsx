/* Simple, compiling Settings page to replace the broken one. */
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Manage your account, billing, and preferences.
          </div>
          <Button asChild className="rounded-2xl">
            <a href="/settings/billing">Open Billing</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
