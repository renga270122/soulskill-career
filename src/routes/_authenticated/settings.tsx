import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";
import { PageHeader, Panel } from "@/components/Dash";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/page-meta";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/settings")({
  staticData: { sitemap: false },
  head: () => pageMeta("Privacy & account", "Manage your personal SoulSkill account and privacy."),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const del = useServerFn(deleteMyAccount);
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
      <PageHeader eyebrow="Account" title="Privacy & account" />
      <Panel title="Personal workspace"><p className="break-words text-sm text-muted-foreground">{user.email}</p><p className="mt-3 text-sm text-muted-foreground">Your career details, resumes and personal reflections stay in your personal workspace. You choose when to export and share your documents.</p></Panel>
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
