"use client";
import dynamic from "next/dynamic";
import { href } from "@/lib/site";
const Fallback = ({ src }: { src: string }) => <img src={href(src)} alt="The report on a phone, for a fictional sample account." className="mx-auto block w-full max-w-[19rem] rounded-[2.2rem] border-8 border-[#15131F] bg-[#15131F] shadow-2xl" />;
const Hero3D = dynamic(() => import("./hero-3d").then((m) => m.Hero3D), { ssr: false, loading: () => <Fallback src="/shots/overview-phone.png" /> });
export function Hero3DLazy({ fallback }: { fallback: string }) { return <Hero3D fallback={fallback} />; }
