import type { Metadata } from "next";
import { connection } from "next/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listSchools } from "@/lib/school-store";

export const metadata: Metadata = {
  title: "Điểm chuẩn trường — DuHoc24",
  description: "Điểm học tập và IELTS tối thiểu của các trường tham chiếu.",
};

export default async function SchoolsPage() {
  await connection(); // luôn đọc dữ liệu mới từ database, không prerender lúc build
  const schools = await listSchools();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <h1 className="text-3xl font-medium tracking-tight">Điểm chuẩn trường</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Điểm học tập và IELTS tối thiểu của từng trường, dùng để đối chiếu với hồ sơ của bạn.
        </p>

        <Card className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên trường</TableHead>
                <TableHead>Quốc gia</TableHead>
                <TableHead>Điểm học tập tối thiểu</TableHead>
                <TableHead>Điểm IELTS tối thiểu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Chưa có trường nào.
                  </TableCell>
                </TableRow>
              )}
              {schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{school.country}</TableCell>
                  <TableCell>{school.minGpa.toFixed(1)}</TableCell>
                  <TableCell>{school.minIelts.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
