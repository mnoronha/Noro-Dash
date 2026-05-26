import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";

type Profile = {
  full_name: string | null;
  role: string;
  agencies: { name: string } | null;
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let agencyName = "Agência";
  let userName = user?.email ?? "";
  let userRole = "";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role, agencies(name)")
      .eq("id", user.id)
      .single<Profile>();

    agencyName = profile?.agencies?.name ?? "Agência";
    userName = profile?.full_name ?? user.email ?? "";
    userRole = profile?.role ?? "";
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar agencyName={agencyName} userName={userName} userRole={userRole} />
      <div className="ml-60 flex-1 bg-mist">
        {children}
      </div>
    </div>
  );
}
