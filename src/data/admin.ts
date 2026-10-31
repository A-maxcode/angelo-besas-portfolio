// Mock data for the admin UI prototype. Nothing here is persisted.

export interface MockMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  received: string;
  read: boolean;
}

export const mockMessages: MockMessage[] = [
  {
    id: "msg-1",
    name: "Sample Visitor",
    email: "visitor@example.com",
    subject: "Sample message — inbox preview",
    received: "Sample date",
    read: false,
  },
  {
    id: "msg-2",
    name: "Demo Sender",
    email: "demo@example.com",
    subject: "Sample message — collaboration inquiry",
    received: "Sample date",
    read: true,
  },
];

export interface ActivityItem {
  id: string;
  label: string;
  detail: string;
  when: string;
}

export const mockActivity: ActivityItem[] = [
  { id: "a1", label: "Project updated", detail: "Sample activity entry", when: "—" },
  { id: "a2", label: "Certificate added", detail: "Sample activity entry", when: "—" },
  { id: "a3", label: "Profile edited", detail: "Sample activity entry", when: "—" },
  { id: "a4", label: "New message received", detail: "Sample activity entry", when: "—" },
];
