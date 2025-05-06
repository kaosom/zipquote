import { Show, createSignal, Index } from "solid-js";
import { v4 as uuid } from "uuid";
import { ArrowLeft, Plus, Trash2, Eye, Save, Download } from "lucide-solid";
import { toast } from "solid-toast";

import { Field, TextInput, TextArea, IconButton, TextButton } from "./ui";
import PdfPreview from "./PdfPreview";
import { generatePdf, PdfPayload } from "../utils/pdf";
import type { Estimate, Item } from "../lib/types";

interface Props {
  onBack: () => void;
  onSave: (e: Estimate, replace?: boolean) => boolean;
  saved: Estimate[];
  initial?: Estimate | null;
}

export default function EstimateForm(props: Props) {
  const isEdit = !!props.initial;
  const [preview, setPreview] = createSignal(false);

  const [contractor, setContractor] = createSignal({
    name: props.initial?.contractor.name ?? "",
    company: props.initial?.contractor.company ?? "N/A",
    phone: props.initial?.contractor.phone ?? "",
    email: props.initial?.contractor.email ?? "",
    address: props.initial?.contractor.address ?? "",
  });

  const [client, setClient] = createSignal({
    name: props.initial?.client.name ?? "",
    company: props.initial?.client.company ?? "N/A",
    phone: props.initial?.client.phone ?? "",
    email: props.initial?.client.email ?? "",
    address: props.initial?.client.address ?? "",
  });

  const [items, setItems] = createSignal<Item[]>(
    props.initial?.items ?? [{ id: uuid(), name: "", quantity: 1, price: 0 }]
  );

  const [taxRate, setTaxRate] = createSignal(props.initial?.taxRate ?? 8);

  const subtotal = () => items().reduce((s, i) => s + i.quantity * i.price, 0);
  const tax = () => subtotal() * (taxRate() / 100);
  const total = () => subtotal() + tax();

  const buildPdf = (): PdfPayload => ({
    contractor: contractor(),
    client: client(),
    items: items(),
    taxRate: taxRate(),
    subtotal: subtotal(),
    tax: tax(),
    total: total(),
  });

  const validate = () =>
    contractor().name.trim() !== "" && client().name.trim() !== "";

  const addItem = () =>
    setItems([...items(), { id: uuid(), name: "", quantity: 1, price: 0 }]);

  const removeItem = (id: string) =>
    items().length > 1 && setItems(items().filter((i) => i.id !== id));

  const updateItem = (id: string, field: keyof Item, val: string | number) =>
    setItems(items().map((i) => (i.id === id ? { ...i, [field]: val } : i)));

  const handleSave = async () => {
    if (!validate()) return toast.error("Please fill the required fields");

    const pdf = await generatePdf(buildPdf());
    if (!pdf) return toast.error("Failed to generate PDF");

    const estimate: Estimate = {
      ...buildPdf(),
      id: props.initial?.id ?? uuid(),
      date: props.initial?.date ?? new Date().toISOString(),
      pdfData: pdf.output("datauristring"),
    };

    if (props.onSave(estimate, isEdit)) {
      setPreview(false);

      if (!isEdit) {
        setContractor({
          name: "",
          company: "N/A",
          phone: "",
          email: "",
          address: "",
        });

        setClient({
          name: "",
          company: "N/A",
          phone: "",
          email: "",
          address: "",
        });

        setItems([{ id: uuid(), name: "", quantity: 1, price: 0 }]);
        setTaxRate(8);
        props.onBack();
      }
    }
  };

  return (
    <div class="container mx-auto px-4 py-8">
      <IconButton
        icon={<ArrowLeft class="w-4 h-4" />}
        onClick={props.onBack}
        title="Back"
      />

      <h1 class="text-3xl font-bold my-6 text-center">
        {isEdit ? "Edit Estimate" : "New Estimate"}
      </h1>

      <Show
        when={preview()}
        fallback={
          <form
            onSubmit={(e) => {
              e.preventDefault();
              validate()
                ? setPreview(true)
                : toast.error("Please fill required fields");
            }}
            class="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <section>
              <h2 class="font-semibold mb-4">Contractor</h2>

              <Field label="Name*">
                <TextInput
                  value={contractor().name}
                  onInput={(e) =>
                    setContractor({
                      ...contractor(),
                      name: e.currentTarget.value,
                    })
                  }
                />
              </Field>

              <Field label="Company" class="mt-2">
                <TextInput
                  value={contractor().company}
                  onInput={(e) =>
                    setContractor({
                      ...contractor(),
                      company: e.currentTarget.value,
                    })
                  }
                />
              </Field>

              <Field label="Address" class="mt-2">
                <TextInput
                  value={contractor().address}
                  onInput={(e) =>
                    setContractor({
                      ...contractor(),
                      address: e.currentTarget.value,
                    })
                  }
                />
              </Field>

              <Field label="Phone" class="mt-2">
                <TextInput
                  value={contractor().phone}
                  onInput={(e) =>
                    setContractor({
                      ...contractor(),
                      phone: e.currentTarget.value,
                    })
                  }
                />
              </Field>

              <Field label="Email*" class="mt-2">
                <TextInput
                  type="email"
                  value={contractor().email}
                  onInput={(e) =>
                    setContractor({
                      ...contractor(),
                      email: e.currentTarget.value,
                    })
                  }
                />
              </Field>
            </section>

            <section>
              <h2 class="font-semibold mb-4">Client</h2>

              <Field label="Name*">
                <TextInput
                  value={client().name}
                  onInput={(e) =>
                    setClient({ ...client(), name: e.currentTarget.value })
                  }
                />
              </Field>

              <Field label="Company" class="mt-2">
                <TextInput
                  value={client().company}
                  onInput={(e) =>
                    setClient({ ...client(), company: e.currentTarget.value })
                  }
                />
              </Field>

              <Field label="Address" class="mt-2">
                <TextInput
                  value={client().address}
                  onInput={(e) =>
                    setClient({ ...client(), address: e.currentTarget.value })
                  }
                />
              </Field>

              <Field label="Phone" class="mt-2">
                <TextInput
                  value={client().phone}
                  onInput={(e) =>
                    setClient({ ...client(), phone: e.currentTarget.value })
                  }
                />
              </Field>

              <Field label="Email*" class="mt-2">
                <TextInput
                  type="email"
                  value={client().email}
                  onInput={(e) =>
                    setClient({ ...client(), email: e.currentTarget.value })
                  }
                />
              </Field>
            </section>

            <section class="md:col-span-2">
              <div class="flex justify-between items-center mb-2">
                <h2 class="font-semibold">Items</h2>
                <TextButton onClick={addItem}>
                  <Plus class="w-4 h-4" /> Add
                </TextButton>
              </div>

              <Index each={items()}>
                {(it) => (
                  <div class="grid grid-cols-12 gap-2 items-end mb-2">
                    <TextArea
                      class="col-span-6"
                      placeholder="Description*"
                      value={it().name}
                      onInput={(e) =>
                        updateItem(it().id, "name", e.currentTarget.value)
                      }
                    />
                    <TextInput
                      type="number"
                      min="1"
                      class="col-span-2"
                      value={it().quantity.toString()}
                      onInput={(e) =>
                        updateItem(
                          it().id,
                          "quantity",
                          e.currentTarget.valueAsNumber
                        )
                      }
                    />
                    <TextInput
                      type="number"
                      min="0"
                      step="0.01"
                      class="col-span-3"
                      value={it().price.toString()}
                      onInput={(e) =>
                        updateItem(
                          it().id,
                          "price",
                          e.currentTarget.valueAsNumber
                        )
                      }
                    />
                    <IconButton
                      icon={<Trash2 class="w-4 h-4" />}
                      intent="danger"
                      onClick={() => removeItem(it().id)}
                    />
                  </div>
                )}
              </Index>

              <div class="flex justify-between mt-4">
                <span>Tax rate (%)</span>
                <TextInput
                  type="number"
                  class="w-24 text-right"
                  value={taxRate()}
                  onInput={(e) => setTaxRate(+e.currentTarget.value)}
                />
              </div>

              <div class="text-right space-y-1 mt-2">
                <p>Subtotal: ${subtotal().toFixed(2)}</p>
                <p>Tax: ${tax().toFixed(2)}</p>
                <p class="font-bold">Total: ${total().toFixed(2)}</p>
              </div>
            </section>

            <div class="md:col-span-2 flex justify-center gap-4 mt-4">
              <TextButton onClick={() => setPreview(true)}>
                <Eye class="w-4 h-4" /> Preview
              </TextButton>

              <TextButton primary onClick={handleSave}>
                <Save class="w-4 h-4" /> {isEdit ? "Update" : "Save"}
              </TextButton>
            </div>
          </form>
        }
      >
        <div>
          <TextButton onClick={() => setPreview(false)}>
            <ArrowLeft class="w-4 h-4" /> Back to form
          </TextButton>

          <PdfPreview {...buildPdf()} />

          <div class="flex justify-center gap-4 mt-4">
            <TextButton
              onClick={async () => {
                const pdf = await generatePdf(buildPdf());
                pdf?.save("estimate.pdf");
              }}
            >
              <Download class="w-4 h-4" /> Download PDF
            </TextButton>

            <TextButton primary onClick={handleSave}>
              <Save class="w-4 h-4" /> {isEdit ? "Update" : "Save"}
            </TextButton>
          </div>
        </div>
      </Show>
    </div>
  );
}
