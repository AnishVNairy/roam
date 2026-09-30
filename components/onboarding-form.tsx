"use client";

import { useState } from "react";
import { useActionState } from "react";
import { completeOnboardingAction } from "@/app/actions/profile";
import { TextAreaField, TextInput } from "@/components/form-field";
import { initialActionState } from "@/lib/forms";
import { validateRiderDetails } from "@/lib/validation";

export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [riderValues, setRiderValues] = useState({ username: "", displayName: "", city: "", bio: "" });
  const [motorcycleValues, setMotorcycleValues] = useState({ make: "", model: "", year: "" });
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [state, action, pending] = useActionState(completeOnboardingAction, initialActionState);
  const errors = state.fieldErrors ?? {};

  function updateRiderValue(field: keyof typeof riderValues, value: string) {
    setRiderValues((current) => ({ ...current, [field]: value }));
  }

  function updateMotorcycleValue(field: keyof typeof motorcycleValues, value: string) {
    setMotorcycleValues((current) => ({ ...current, [field]: value }));
  }

  function continueToBike(form: HTMLFormElement) {
    const data = new FormData(form);
    const riderErrors = validateRiderDetails({ username: String(data.get("username") ?? ""), displayName: String(data.get("displayName") ?? ""), city: String(data.get("city") ?? ""), bio: String(data.get("bio") ?? "") });
    setLocalErrors(riderErrors);
    if (!Object.keys(riderErrors).length) setStep(2);
  }

  return <form action={action} className="mt-7" onSubmit={(event) => { if (step === 1) { event.preventDefault(); continueToBike(event.currentTarget); } }}>
    <div className="mb-7 flex items-center gap-3" aria-label={`Step ${step} of 2`}>
      <span className={`grid size-8 place-items-center rounded-full font-mono text-xs ${step === 1 ? "bg-petrol text-white" : "bg-sage/25 text-petrol"}`}>01</span>
      <span className={`h-px flex-1 ${step === 2 ? "bg-signal" : "bg-line"}`} />
      <span className={`grid size-8 place-items-center rounded-full font-mono text-xs ${step === 2 ? "bg-petrol text-white" : "bg-line text-muted"}`}>02</span>
    </div>
    {step === 2 ? Object.entries(riderValues).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />) : null}
    {step === 1 ? <section key="rider-step" aria-labelledby="rider-step-title" className="space-y-5">
      <div><p className="font-mono text-[10px] tracking-[0.16em] text-signal">STEP 01 / 02</p><h2 id="rider-step-title" className="mt-2 text-2xl font-semibold tracking-tight text-ink">Your rider card</h2><p className="mt-2 text-sm leading-6 text-muted">Give other riders a name and a little sense of where you roam.</p></div>
      <TextInput id="username" name="username" label="Username" autoComplete="username" placeholder="openroad_rider" required maxLength={24} hint="3–24 letters, numbers, or underscores." error={localErrors.username || errors.username} value={riderValues.username} onChange={(event) => updateRiderValue("username", event.currentTarget.value)} />
      <TextInput id="displayName" name="displayName" label="Display name" autoComplete="name" placeholder="How riders know you" required maxLength={60} error={localErrors.displayName || errors.displayName} value={riderValues.displayName} onChange={(event) => updateRiderValue("displayName", event.currentTarget.value)} />
      <TextInput id="city" name="city" label="Home base (optional)" autoComplete="address-level2" placeholder="City or region" maxLength={80} error={localErrors.city || errors.city} value={riderValues.city} onChange={(event) => updateRiderValue("city", event.currentTarget.value)} />
      <TextAreaField id="bio" name="bio" label="A little about you (optional)" placeholder="Favorite roads, riding style, anything you want to share…" maxLength={280} rows={3} error={localErrors.bio || errors.bio} value={riderValues.bio} onChange={(event) => updateRiderValue("bio", event.currentTarget.value)} />
      <button type="button" onClick={(event) => continueToBike(event.currentTarget.form!)} className="min-h-12 w-full rounded-control bg-petrol px-5 text-sm font-semibold text-white hover:bg-petrol/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">Continue to your motorcycle</button>
    </section> : <section key="motorcycle-step" aria-labelledby="bike-step-title" className="space-y-5">
      <div><p className="font-mono text-[10px] tracking-[0.16em] text-signal">STEP 02 / 02</p><h2 id="bike-step-title" className="mt-2 text-2xl font-semibold tracking-tight text-ink">Your motorcycle</h2><p className="mt-2 text-sm leading-6 text-muted">Optional for now. You can add the bike that takes you places.</p></div>
      <TextInput id="make" name="make" label="Make (optional)" placeholder="Honda" maxLength={60} error={errors.make} value={motorcycleValues.make} onChange={(event) => updateMotorcycleValue("make", event.currentTarget.value)} />
      <TextInput id="model" name="model" label="Model (optional)" placeholder="Africa Twin" maxLength={80} error={errors.model} value={motorcycleValues.model} onChange={(event) => updateMotorcycleValue("model", event.currentTarget.value)} />
      <TextInput id="year" name="year" label="Model year (optional)" placeholder="2024" inputMode="numeric" error={errors.year} value={motorcycleValues.year} onChange={(event) => updateMotorcycleValue("year", event.currentTarget.value)} />
      {state.message ? <p role={state.status === "error" ? "alert" : "status"} className="text-sm leading-6 text-danger">{state.message}</p> : null}
      <div className="flex gap-3"><button type="button" onClick={() => setStep(1)} className="min-h-12 rounded-control border border-line px-5 text-sm font-medium text-petrol hover:border-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">Back</button><button disabled={pending} className="min-h-12 flex-1 rounded-control bg-petrol px-5 text-sm font-semibold text-white hover:bg-petrol/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:opacity-60">{pending ? "Saving your rider card…" : "Finish setup"}</button></div>
    </section>}
  </form>;
}
