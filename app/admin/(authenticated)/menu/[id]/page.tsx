import { MenuForm } from '@/components/admin/pages/MenuForm';

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Edit Menu</h2>
      <MenuForm menuId={id} />
    </div>
  );
}
