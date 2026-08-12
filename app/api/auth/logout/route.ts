Exit code: 0
Wall time: 2.9 seconds
Output:
import{NextRequest,NextResponse}from"next/server";import{destroyUserSession}from"../../../user-auth";export async function GET(request:NextRequest){await destroyUserSession();const value=request.nextUrl.searchParams.get("return_to")||"/";const target=value.startsWith("/")&&!value.startsWith("//")?value:"/";return NextResponse.redirect(new URL(target,request.url),303)}

