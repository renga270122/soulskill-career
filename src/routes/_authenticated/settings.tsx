import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";
import { PageHeader, Panel } from "@/components/Dash";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Privacy & account — SoulSkill" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const del = useServerFn(deleteMyAccount);

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async (discoverable: boolean) => {
      const { error } = await supabase.from("profiles").update({ discoverable, updated_at: new Date().toISOString() }).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success(v ? "You're now visible to recruiters" : "Consent withdrawn — you're hidden from recruiters");
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: () => del(),
    onSuccess: async () => {
      qc.clear();
      await supabase.auth.signOut();
      toast.success("Your account and data were deleted");
      navigate({ to: "/", replace: true });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader eyebrow="Account" title="Privacy & consent" />
      <Panel title="Recruiter visibility">
        <div className="flex items-start justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            When on, recruiters on SoulSkill can find your name and headline. Your resumes and contact details
            stay private. Turn this off at any time to withdraw consent.
          </p>
          <Switch
            checked={!!profile?.discoverable}
            disabled={!profile || toggle.isPending}
            onCheckedChange={(v) => toggle.mutate(v)}
            aria-label="Allow recruiters to discover me"
          />
        </div>
      </Panel>
      <Panel title="Delete account">
        <p className="text-sm text-muted-foreground">
          Permanently deletes your account, profile and all associated data. This cannot be undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4">Delete my account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your SoulSkill account?</AlertDialogTitle>
              <AlertDialogDescription>All of your data will be permanently removed.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => remove.mutate()} disabled={remove.isPending}>
                Delete permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Panel>
    </div>
  );
}
