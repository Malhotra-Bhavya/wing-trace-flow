import { createFileRoute } from "@tanstack/react-router";
import { MasterTable } from "@/components/MasterTable";

type Airline = { id: string; name: string; iata_code: string | null; awb_prefix: string | null; contact: string | null };

export const Route = createFileRoute("/_authenticated/masters/airlines")({
  head: () => ({ meta: [{ title: "Airlines — Multiwings" }] }),
  component: () => (
    <MasterTable<Airline>
      title="Airlines"
      subtitle="Carriers used for air freight, with IATA codes and AWB prefixes."
      table="airlines"
      searchKeys={["name", "iata_code", "awb_prefix"]}
      fields={[
        { key: "name", label: "Airline name", required: true },
        { key: "iata_code", label: "IATA code", placeholder: "e.g. LH" },
        { key: "awb_prefix", label: "AWB prefix", placeholder: "e.g. 020" },
        { key: "contact", label: "Contact", type: "textarea" },
      ]}
      columns={[
        { key: "name", label: "Airline" },
        { key: "iata_code", label: "IATA" },
        { key: "awb_prefix", label: "Prefix" },
        { key: "contact", label: "Contact" },
      ]}
    />
  ),
});
