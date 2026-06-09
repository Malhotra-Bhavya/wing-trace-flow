import { createFileRoute } from "@tanstack/react-router";
import { MasterTable } from "@/components/MasterTable";

type Agent = { id: string; name: string; iata_code: string | null; city: string | null; country: string | null; email: string | null; phone: string | null; address: string | null };

export const Route = createFileRoute("/_authenticated/masters/agents")({
  head: () => ({ meta: [{ title: "Agents — Multiwings" }] }),
  component: () => (
    <MasterTable<Agent>
      title="Agents"
      subtitle="Destination and origin partner agents."
      table="agents"
      searchKeys={["name", "iata_code", "city", "country", "email"]}
      fields={[
        { key: "name", label: "Agent name", required: true },
        { key: "iata_code", label: "IATA code" },
        { key: "address", label: "Address", type: "textarea" },
        { key: "city", label: "City" },
        { key: "country", label: "Country" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email", type: "email" },
      ]}
      columns={[
        { key: "name", label: "Agent" },
        { key: "iata_code", label: "IATA" },
        { key: "city", label: "City" },
        { key: "country", label: "Country" },
        { key: "email", label: "Email" },
      ]}
    />
  ),
});
