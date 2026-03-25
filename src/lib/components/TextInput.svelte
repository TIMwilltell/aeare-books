<script lang="ts">
	interface Props {
		label: string;
		placeholder?: string;
		value?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		type?: 'text' | 'email' | 'password' | 'number';
		id?: string;
		oninput?: (e: Event) => void;
	}

	let {
		label,
		placeholder = '',
		value = $bindable(''),
		error,
		disabled = false,
		required = false,
		type = 'text',
		id,
		oninput
	}: Props = $props();

	const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
	const errorId = `${inputId}-error`;
</script>

<div class="text-input-wrapper" class:has-error={!!error} class:disabled>
	<label for={inputId} class="input-label">
		{label}
		{#if required}
			<span class="required" aria-hidden="true">*</span>
		{/if}
	</label>
	
	<input
		id={inputId}
		type={type}
		{placeholder}
		bind:value
		{disabled}
		{required}
		aria-invalid={!!error}
		aria-describedby={error ? errorId : undefined}
		class="text-input"
		{oninput}
	/>
	
	{#if error}
		<span id={errorId} class="error-message" role="alert">
			{error}
		</span>
	{/if}
</div>

<style>
	.text-input-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
	}

	.input-label {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--on-surface-variant);
	}

	.required {
		color: var(--error);
		margin-left: 2px;
	}

	.text-input {
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--on-surface);
		background-color: var(--surface-container-highest);
		border: 2px solid transparent;
		border-radius: var(--radius-DEFAULT);
		outline: none;
		transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
		width: 100%;
	}

	.text-input::placeholder {
		color: var(--on-surface-variant);
		opacity: 0.6;
	}

	.text-input:focus {
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(0, 93, 167, 0.1);
	}

	.has-error .text-input {
		border-color: var(--error);
	}

	.has-error .text-input:focus {
		box-shadow: 0 0 0 3px rgba(179, 27, 37, 0.1);
	}

	.error-message {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--error);
	}

	.disabled {
		opacity: 0.38;
		pointer-events: none;
	}
</style>
