import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminIdToken } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await verifyAdminIdToken(token);

    const body = (await request.json().catch(() => ({}))) as {
      paths?: string[];
      slug?: string;
    };

    const paths = new Set<string>(body.paths ?? ["/", "/topics"]);
    if (body.slug) {
      paths.add(`/article/${body.slug}`);
    }
    paths.add("/section/[section]");

    for (const p of paths) {
      if (p.includes("[")) {
        revalidatePath(p, "page");
      } else {
        revalidatePath(p);
      }
    }
    // Revalidate all section pages layout-wide
    revalidatePath("/", "layout");

    return NextResponse.json({ revalidated: true, paths: [...paths] });
  } catch (err) {
    console.error("revalidate failed:", err);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
