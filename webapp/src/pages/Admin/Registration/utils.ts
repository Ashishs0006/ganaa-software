export interface ITab {
  id: number;
  tabs: string;
}

export const tabs: ITab[] = [
  { id: 1, tabs: "Basic Details" },
  { id: 2, tabs: "Profile & Contacts" },
  { id: 3, tabs: "Admission Checklist" }
];
