import { switchActiveOrg } from "@/app/(app)/dashboard/actions";

type OrgSwitcherProps = {
  activeOrgId: string | null;
  memberships: Array<{
    orgId: string;
    orgName: string;
    role: string;
  }>;
};

export function OrgSwitcher({ activeOrgId, memberships }: OrgSwitcherProps) {
  return (
    <form action={switchActiveOrg} className="space-y-2">
      <label className="block text-sm font-medium">ארגון פעיל</label>
      <div className="flex gap-3">
        <select
          name="orgId"
          defaultValue={activeOrgId ?? memberships[0]?.orgId}
          className="tap-target w-full rounded-[12px] border border-border bg-surface px-4"
        >
          {memberships.map((membership) => (
            <option key={membership.orgId} value={membership.orgId}>
              {membership.orgName} | {membership.role}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="tap-target rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-strong"
        >
          החלף
        </button>
      </div>
    </form>
  );
}
