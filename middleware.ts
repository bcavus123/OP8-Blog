Exit code: 0
Wall time: 2.7 seconds
Output:
import{NextResponse}from"next/server";
export function middleware(){return NextResponse.next()}
export const config={matcher:["/admin/:path*","/api/admin/:path*"]};

