import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { keyLocalStorageLogin } from "./utils/constant";

const excludePathCheckingToken = (path: string) => {
  return (
    path.startsWith("/login") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon")
  );
};

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const url = request.nextUrl.pathname;
  const accessToken = request.cookies.get(keyLocalStorageLogin);

  if (accessToken !== undefined && url.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  /// Check apakah url sekarang termaksud kedalam url yang tidak diikut sertakan pengecekan token
  if (excludePathCheckingToken(url)) {
    return NextResponse.next();
  }

  if (!excludePathCheckingToken(url)) {
    if (accessToken == undefined) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}
