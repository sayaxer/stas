export const valOf = (d) => {
  if (d.lines && d.lines.length) {
    return d.lines.reduce((a, l) => a + (l.retail || 0) * (+l.qty || 0), 0);
  }
  return +d.value || 0;
};

export const paidOf = (d) => +d.paid || 0;

export const dealFromDB = (r) => ({
  ...r,
  clientId: r.client_id || "",
  lines: r.lines || [],
  value: +r.value || 0,
  paid: +r.paid || 0,
});

export const dealToDB = (d) => ({
  id: d.id,
  client: d.client,
  client_id: d.clientId || null,
  vertical: d.vertical,
  service: d.service,
  value: d.value,
  paid: d.paid,
  lines: d.lines,
  stage: d.stage,
  assignee: d.assignee,
  next: d.next,
  due: d.due || null,
});

export const cliFromDB = (r) => ({
  ...r,
  lastContact: r.last_contact || "",
});

export const cliToDB = (c) => ({
  id: c.id,
  name: c.name,
  contact: c.contact,
  vertical: c.vertical,
  status: c.status,
  last_contact: c.lastContact || null,
  note: c.note,
});
