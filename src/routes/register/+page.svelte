<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { onMount, getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { WEBUI_BASE_URL } from '$lib/constants';
	import { WEBUI_NAME, config, user } from '$lib/stores';
	import { BOUTIKIO_BASE_URL } from '$lib/config/boutikio';
	import Spinner from '$lib/components/common/Spinner.svelte';

	const i18n = getContext('i18n');

	let loaded = false;
	let loading = false;

	// Form fields
	let name = '';
	let email = '';
	let phoneCountry = 'FR';
	let phoneNumber = '';
	let consent = false;
	let companyUrl = ''; // Honeypot field

	// Error messages
	let errors: Record<string, string> = {};

	// Country codes with dial codes
	const countryCodes = [
		{ code: 'FR', name: 'France', dial: '+33' },
		{ code: 'BE', name: 'Belgique', dial: '+32' },
		{ code: 'CH', name: 'Suisse', dial: '+41' },
		{ code: 'DE', name: 'Allemagne', dial: '+49' },
		{ code: 'ES', name: 'Espagne', dial: '+34' },
		{ code: 'IT', name: 'Italie', dial: '+39' },
		{ code: 'NL', name: 'Pays-Bas', dial: '+31' },
		{ code: 'PT', name: 'Portugal', dial: '+351' },
		{ code: 'GB', name: 'Royaume-Uni', dial: '+44' },
		{ code: 'US', name: 'États-Unis', dial: '+1' },
		{ code: 'CA', name: 'Canada', dial: '+1' },
		{ code: 'BR', name: 'Brésil', dial: '+55' },
		{ code: 'AU', name: 'Australie', dial: '+61' },
		{ code: 'AT', name: 'Autriche', dial: '+43' },
		{ code: 'DK', name: 'Danemark', dial: '+45' },
		{ code: 'FI', name: 'Finlande', dial: '+358' },
		{ code: 'IE', name: 'Irlande', dial: '+353' },
		{ code: 'LU', name: 'Luxembourg', dial: '+352' },
		{ code: 'NO', name: 'Norvège', dial: '+47' },
		{ code: 'SE', name: 'Suède', dial: '+46' }
	];

	function getDialCode(countryCode: string): string {
		const country = countryCodes.find((c) => c.code === countryCode);
		return country?.dial || '+33';
	}

	function validateForm(): boolean {
		errors = {};

		if (!name || name.trim().length < 2) {
			errors.name = 'Le nom est requis (minimum 2 caractères).';
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email || !emailRegex.test(email)) {
			errors.email = 'Veuillez entrer une adresse email valide.';
		}

		// E.164 format validation
		const phoneRegex = /^\+[1-9]\d{1,14}$/;
		const fullPhone = getDialCode(phoneCountry) + phoneNumber.replace(/\D/g, '');
		if (!phoneNumber || !phoneRegex.test(fullPhone)) {
			errors.phone = 'Veuillez entrer un numéro de téléphone valide.';
		}

		if (!consent) {
			errors.consent = 'Vous devez accepter les conditions d\'utilisation.';
		}

		return Object.keys(errors).length === 0;
	}

	async function submitHandler() {
		if (!validateForm()) {
			return;
		}

		loading = true;
		errors = {};

		try {
			const fullPhone = getDialCode(phoneCountry) + phoneNumber.replace(/\D/g, '');

			const response = await fetch(`${BOUTIKIO_BASE_URL}/api/v1/partner/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					phone: fullPhone,
					phone_country: phoneCountry,
					consent: true,
					company_url: companyUrl // Honeypot
				})
			});

			const data = await response.json();

			if (response.status === 201) {
				// Success - redirect to auth page with success message
				goto('/auth?success=Compte créé ! Vérifiez votre email pour votre mot de passe.');
			} else if (response.status === 422) {
				// Validation errors
				if (data.errors) {
					// Map API errors to form fields
					Object.entries(data.errors).forEach(([key, value]) => {
						const messages = Array.isArray(value) ? value : [value];
						errors[key] = messages[0];
					});
				}
				toast.error('Veuillez corriger les erreurs dans le formulaire.');
			} else {
				// Server error
				toast.error(data.error || 'Une erreur est survenue. Veuillez réessayer.');
			}
		} catch (error) {
			console.error('Registration error:', error);
			toast.error('Une erreur est survenue. Veuillez réessayer.');
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		// Redirect if already logged in
		if ($user !== undefined) {
			goto('/');
			return;
		}

		loaded = true;
	});
</script>

<svelte:head>
	<title>Créer votre compte - {$WEBUI_NAME}</title>
</svelte:head>

<div class="w-full h-screen max-h-[100dvh] text-white relative" id="register-page">
	<div class="w-full h-full absolute top-0 left-0 bg-white dark:bg-black"></div>

	<div class="w-full absolute top-0 left-0 right-0 h-8 drag-region" />

	{#if loaded}
		<div
			class="fixed bg-transparent min-h-screen w-full flex justify-center font-primary z-50 text-black dark:text-white"
			id="register-container"
		>
			<div class="w-full px-10 min-h-screen flex flex-col text-center">
				<div class="my-auto flex flex-col justify-center items-center">
					<div class="sm:max-w-md my-auto pb-10 w-full dark:text-gray-100">
						<!-- Logo -->
						<div class="flex justify-center mb-6">
							<img
								crossorigin="anonymous"
								src="{WEBUI_BASE_URL}/static/boutikio-logo.svg"
								class="size-24 rounded-full"
								alt="{$WEBUI_NAME} logo"
							/>
						</div>

						<form
							class="flex flex-col justify-center"
							on:submit={(e) => {
								e.preventDefault();
								submitHandler();
							}}
						>
							<div class="mb-1">
								<div class="text-2xl font-medium">
									Créer votre compte Boutikio
								</div>
							</div>

							<div class="flex flex-col mt-4 text-left">
								<!-- Name -->
								<div class="mb-3">
									<label for="name" class="text-sm font-medium mb-1 block">Nom</label>
									<input
										bind:value={name}
										type="text"
										id="name"
										class="my-0.5 w-full text-sm outline-hidden bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-[#C2420D] dark:focus:border-[#C2420D] placeholder:text-gray-400 dark:placeholder:text-gray-500 py-2"
										autocomplete="name"
										placeholder="Votre nom complet"
										required
									/>
									{#if errors.name}
										<p class="text-xs text-red-500 mt-1">{errors.name}</p>
									{/if}
								</div>

								<!-- Email -->
								<div class="mb-3">
									<label for="email" class="text-sm font-medium mb-1 block">Email</label>
									<input
										bind:value={email}
										type="email"
										id="email"
										class="my-0.5 w-full text-sm outline-hidden bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-[#C2420D] dark:focus:border-[#C2420D] placeholder:text-gray-400 dark:placeholder:text-gray-500 py-2"
										autocomplete="email"
										placeholder="votre@email.com"
										required
									/>
									{#if errors.email}
										<p class="text-xs text-red-500 mt-1">{errors.email}</p>
									{/if}
								</div>

								<!-- Phone -->
								<div class="mb-3">
									<label for="phone" class="text-sm font-medium mb-1 block">Téléphone</label>
									<div class="flex gap-2">
										<select
											bind:value={phoneCountry}
											class="text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-[#C2420D] dark:focus:border-[#C2420D] py-2 pr-8 outline-hidden cursor-pointer"
										>
											{#each countryCodes as country}
												<option value={country.code}>{country.code} ({country.dial})</option>
											{/each}
										</select>
										<input
											bind:value={phoneNumber}
											type="tel"
											id="phone"
											class="flex-1 my-0.5 text-sm outline-hidden bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-[#C2420D] dark:focus:border-[#C2420D] placeholder:text-gray-400 dark:placeholder:text-gray-500 py-2"
											autocomplete="tel"
											placeholder="612345678"
											required
										/>
									</div>
									{#if errors.phone}
										<p class="text-xs text-red-500 mt-1">{errors.phone}</p>
									{/if}
								</div>

								<!-- Consent -->
								<div class="mb-4">
									<label class="flex items-start gap-2 cursor-pointer">
										<input
											bind:checked={consent}
											type="checkbox"
											class="mt-0.5 size-4 rounded border-gray-300 text-[#C2420D] focus:ring-[#C2420D] cursor-pointer"
										/>
										<span class="text-sm text-gray-600 dark:text-gray-400">
											J'accepte les <a
												href="{BOUTIKIO_BASE_URL}/terms"
												target="_blank"
												class="underline hover:text-[#C2420D]">conditions d'utilisation</a
											>
											et la
											<a
												href="{BOUTIKIO_BASE_URL}/privacy"
												target="_blank"
												class="underline hover:text-[#C2420D]">politique de confidentialité</a
											>.
										</span>
									</label>
									{#if errors.consent}
										<p class="text-xs text-red-500 mt-1">{errors.consent}</p>
									{/if}
								</div>

								<!-- Honeypot field - hidden from humans -->
								<div class="hidden" style="position:absolute; left:-9999px; opacity:0;">
									<input bind:value={companyUrl} type="text" name="company_url" tabindex="-1" />
								</div>
							</div>

							<div class="mt-5">
								<button
									class="bg-[#C2420D] hover:bg-[#9a3412] text-white transition w-full rounded-full font-medium text-sm py-2.5 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
									type="submit"
									disabled={loading}
								>
									{#if loading}
										<Spinner className="size-4" />
										<span>Création en cours...</span>
									{:else}
										<span>Créer mon compte</span>
									{/if}
								</button>

								<div class="mt-4 text-sm text-center font-medium">
									<a href="/auth" class="underline hover:text-[#C2420D]">
										Déjà un compte ? Se connecter
									</a>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>

		<div class="fixed m-10 z-50">
			<div class="flex space-x-2">
				<div class="self-center">
					<img
						crossorigin="anonymous"
						src="{WEBUI_BASE_URL}/static/boutikio-logo.svg"
						class="w-6 rounded-full"
						alt=""
					/>
				</div>
			</div>
		</div>
	{/if}
</div>
