import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { type NextRequest, NextResponse } from "next/server";

import { docsContentRoute, docsRoute } from "@/lib/shared";

const { rewrite: rewriteDocs } = rewritePath(
	`${docsRoute}{/*path}`,
	`${docsContentRoute}{/*path}/content.md`
);
const { rewrite: rewriteSuffix } = rewritePath(
	`${docsRoute}{/*path}.md`,
	`${docsContentRoute}{/*path}/content.md`
);

export default function proxy(request: NextRequest) {
	const result = rewriteSuffix(request.nextUrl.pathname);
	if (result) {
		return NextResponse.rewrite(new URL(result, request.nextUrl));
	}

	if (isMarkdownPreferred(request)) {
		const docResult = rewriteDocs(request.nextUrl.pathname);

		if (docResult) {
			return NextResponse.rewrite(new URL(docResult, request.nextUrl), {
				// this URL has two representations, selected by `Accept`
				headers: { Vary: "Accept" },
			});
		}
	}

	return NextResponse.next();
}
