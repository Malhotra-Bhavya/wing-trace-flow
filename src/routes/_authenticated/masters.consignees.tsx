import { createFileRoute } from "@tanstack/react-router";
import { MasterTable } from "@/components/MasterTable";

type Consignee = { id: string; name: string; city: string | null; country: string | null; gstin: string | null; phone: string | null; email: string | null; address: string | null };

export const Route = createFileRoute("/_authenticated/masters/consignees")({
  head: () => ({ meta: [{ title: "Consignees — Multiwings" }] }),
  component: () => (
    <MasterTable<Consignee>
      title="Consignees"
      subtitle="Destination parties receiving cargo."
      table="consignees"
      searchKeys={["name", "city", "gstin", "email"]}
      fields={[
        { key: "name", label: "Company name", required: true },
        { key: "address", label: "Address", type: "textarea" },
        { key: "city", label: "City" },
        { key: "country", label: "Country" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email", type: "email" },
        { key: "gstin", label: "GSTIN" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "city", label: "City" },
        { key: "country", label: "Country" },
        { key: "gstin", label: "GSTIN" },
        { key: "phone", label: "Phone" },
      ]}
    />
  ),
});
