import starlight from "@astrojs/starlight";
// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			sidebar: [
				{
					items: [
						{ label: "Começando", slug: "guides/getting-started" },
						{ label: "Página do Projeto", slug: "guides/project-page" },
						{ label: "Tags", slug: "guides/tags" },
						{ label: "Comentários", slug: "guides/comments" },
						{ label: "Configurações", slug: "guides/settings" },
						{ label: "Componentes UI", slug: "guides/ui-components" },
						{ label: "Fluxo de Autenticação", slug: "guides/auth-flow" },
					],
					label: "Guias",
				},
				{
					items: [{ autogenerate: { directory: "reference" } }],
					label: "Referência",
				},
			],
			social: [
				{
					href: "https://github.com/MxTeg/TaskNest",
					icon: "github",
					label: "GitHub",
				},
			],
			title: "TaskNest Frontend",
		}),
	],
});
