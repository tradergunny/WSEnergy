"use client";

import { useReducer } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { RfqStep1ProjectType } from "./RfqStep1ProjectType";
import { RfqStep2Size } from "./RfqStep2Size";
import { RfqStep3Products } from "./RfqStep3Products";
import { RfqStep4Timeline } from "./RfqStep4Timeline";
import { RfqStep5Contact } from "./RfqStep5Contact";

const TOTAL_STEPS = 5;

type ContactData = {
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string;
  notes: string;
  file: File | null;
};

type State = {
  step: number;
  projectType: string;
  projectSize: string;
  productsOfInterest: string[];
  timeline: string;
  contact: ContactData;
  errors: Record<string, string>;
  submitting: boolean;
};

type Action =
  | { type: "SET_STEP"; step: number }
  | { type: "SET_PROJECT_TYPE"; value: string }
  | { type: "SET_PROJECT_SIZE"; value: string }
  | { type: "SET_PRODUCTS"; value: string[] }
  | { type: "SET_TIMELINE"; value: string }
  | { type: "SET_CONTACT"; value: ContactData }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "SET_SUBMITTING"; value: boolean };

const initialState: State = {
  step: 1,
  projectType: "",
  projectSize: "",
  productsOfInterest: [],
  timeline: "",
  contact: {
    name: "",
    company: "",
    email: "",
    phone: "",
    role: "",
    notes: "",
    file: null,
  },
  errors: {},
  submitting: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step, errors: {} };
    case "SET_PROJECT_TYPE":
      return { ...state, projectType: action.value };
    case "SET_PROJECT_SIZE":
      return { ...state, projectSize: action.value };
    case "SET_PRODUCTS":
      return { ...state, productsOfInterest: action.value };
    case "SET_TIMELINE":
      return { ...state, timeline: action.value };
    case "SET_CONTACT":
      return { ...state, contact: action.value };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.value };
  }
}

const contactSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
});

type Props = {
  dict: Dictionary;
  locale: Locale;
};

export function RfqForm({ dict, locale }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();
  const t = dict.rfq;

  function goNext() {
    dispatch({ type: "SET_STEP", step: Math.min(state.step + 1, TOTAL_STEPS) });
  }

  function goBack() {
    dispatch({ type: "SET_STEP", step: Math.max(state.step - 1, 1) });
  }

  async function handleSubmit() {
    const result = contactSchema.safeParse(state.contact);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (key === "name") fieldErrors.name = t.step5.errorName;
        else if (key === "company") fieldErrors.company = t.step5.errorCompany;
        else if (key === "email") fieldErrors.email = t.step5.errorEmail;
        else if (key === "phone") fieldErrors.phone = t.step5.errorPhone;
      }
      dispatch({ type: "SET_ERRORS", errors: fieldErrors });
      return;
    }

    dispatch({ type: "SET_SUBMITTING", value: true });
    dispatch({ type: "SET_ERRORS", errors: {} });

    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType: state.projectType || undefined,
          projectSize: state.projectSize || undefined,
          productsOfInterest: state.productsOfInterest.length
            ? state.productsOfInterest
            : undefined,
          timeline: state.timeline || undefined,
          name: state.contact.name,
          company: state.contact.company,
          email: state.contact.email,
          phone: state.contact.phone,
          role: state.contact.role || undefined,
          notes: state.contact.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.fieldErrors) {
          dispatch({ type: "SET_ERRORS", errors: data.fieldErrors });
        } else {
          dispatch({
            type: "SET_ERRORS",
            errors: { _form: t.step5.errorSubmit },
          });
        }
        dispatch({ type: "SET_SUBMITTING", value: false });
        return;
      }

      const { reference } = (await res.json()) as { reference: string };
      router.push(`/${locale}/quote/confirmation?ref=${reference}`);
    } catch {
      dispatch({
        type: "SET_ERRORS",
        errors: { _form: t.step5.errorSubmit },
      });
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const stepNum = i + 1;
          const active = stepNum === state.step;
          const done = stepNum < state.step;
          return (
            <div key={stepNum} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-caption font-medium transition-colors duration-150 ${
                  active
                    ? "bg-gold-500 text-forest-900"
                    : done
                      ? "bg-gold-500/20 text-gold-500"
                      : "bg-forest-800 text-mist-400"
                }`}
              >
                {stepNum}
              </div>
              {stepNum < TOTAL_STEPS && (
                <div
                  className={`h-0.5 w-6 transition-colors duration-150 ${
                    done ? "bg-gold-500/40" : "bg-mist-800"
                  }`}
                />
              )}
            </div>
          );
        })}
        <span className="ml-auto text-caption text-mist-400">
          {t.stepOf
            .replace("{current}", String(state.step))
            .replace("{total}", String(TOTAL_STEPS))}
        </span>
      </div>

      {/* Active step */}
      {state.step === 1 && (
        <RfqStep1ProjectType
          dict={dict}
          value={state.projectType}
          onChange={(v) => dispatch({ type: "SET_PROJECT_TYPE", value: v })}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {state.step === 2 && (
        <RfqStep2Size
          dict={dict}
          value={state.projectSize}
          onChange={(v) => dispatch({ type: "SET_PROJECT_SIZE", value: v })}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {state.step === 3 && (
        <RfqStep3Products
          dict={dict}
          value={state.productsOfInterest}
          onChange={(v) => dispatch({ type: "SET_PRODUCTS", value: v })}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {state.step === 4 && (
        <RfqStep4Timeline
          dict={dict}
          value={state.timeline}
          onChange={(v) => dispatch({ type: "SET_TIMELINE", value: v })}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {state.step === 5 && (
        <RfqStep5Contact
          dict={dict}
          value={state.contact}
          onChange={(v) => dispatch({ type: "SET_CONTACT", value: v })}
          errors={state.errors}
          onSubmit={handleSubmit}
          onBack={goBack}
          submitting={state.submitting}
        />
      )}
    </div>
  );
}
