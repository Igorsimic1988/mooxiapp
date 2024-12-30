// src/data/constants/actualLeads.js

// A list of 50 leads with varied names, statuses, etc.
// We have added new fields: "estimator", "survey_date", "survey_time"
// "estimator" => same as "sales_name"
// "survey_date" => about 2 days prior to "creation_date_time"
// "survey_time" => a random time between 7:00 AM and 8:45 PM

const actualLeads = [
  {
    lead_id: "8a5fc988-0bbf-4aae-a58e-9d089e5719aa",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21554,
    creation_date_time: "07/01/2024",
    customer_name: "John Doe",
    customer_phone_number: "(678) 909-1876",
    customer_email: "john.doe@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "Quoted",
    lead_activity: "Awaiting Decision",
    next_action: "Attempt 1",

    sales_name: "Cynthia Lin",
    is_new: true,

    estimator: "Cynthia Lin",
    survey_date: "06/29/2024", // 2 days before 07/01
    survey_time: "07:30 AM"
  },
  {
    lead_id: "d3cfc4b1-f0c3-42a7-b73a-693b21794c40",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21555,
    creation_date_time: "07/01/2024",
    customer_name: "Jane Smith",
    customer_phone_number: "(404) 555-1234",
    customer_email: "jane.smith@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "Quoted",
    lead_activity: "Awaiting Decision",
    next_action: "Attempt 1",

    sales_name: "David Perry",
    is_new: false,

    estimator: "David Perry",
    survey_date: "06/29/2024",
    survey_time: "09:15 AM"
  },
  {
    lead_id: "32fe5cc1-4b86-4bcf-89cc-d6500aa7d2a4",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21556,
    creation_date_time: "07/02/2024",
    customer_name: "Michael Johnson",
    customer_phone_number: "(770) 222-4532",
    customer_email: "michael.johnson@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Move on Hold",
    lead_activity: "",
    next_action: "",

    sales_name: "Alice Morgan",
    is_new: true,

    estimator: "Alice Morgan",
    survey_date: "06/30/2024",
    survey_time: "07:45 PM"
  },
  {
    lead_id: "c9371593-9bb7-4c61-9ae7-72dc797cd5a3",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21557,
    creation_date_time: "07/02/2024",
    customer_name: "Emily Davis",
    customer_phone_number: "(678) 909-1876",
    customer_email: "emily.davis@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "Booked",
    lead_activity: "Regular Booked",
    next_action: "",

    sales_name: "Brian White",
    is_new: false,

    estimator: "Brian White",
    survey_date: "06/30/2024",
    survey_time: "08:30 PM"
  },
  {
    lead_id: "b7ba2dff-af83-4bb2-8df9-c0fbdee9538c",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21558,
    creation_date_time: "07/03/2024",
    customer_name: "Robert Brown",
    customer_phone_number: "(470) 777-9999",
    customer_email: "robert.brown@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "New Lead",
    lead_activity: "Contacting",
    next_action: "Attempt 1",

    sales_name: "Erika Martinez",
    is_new: true,

    estimator: "Erika Martinez",
    survey_date: "07/01/2024",
    survey_time: "10:00 AM"
  },
  {
    lead_id: "50252d3d-35bb-46d7-9f78-9f36128b7bc8",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21559,
    creation_date_time: "07/03/2024",
    customer_name: "Sophia Martinez",
    customer_phone_number: "(404) 123-9876",
    customer_email: "sophia.martinez@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "Bad Lead",
    lead_activity: "Spam",
    next_action: "",

    sales_name: "Cynthia Lin",
    is_new: false,

    estimator: "Cynthia Lin",
    survey_date: "07/01/2024",
    survey_time: "11:45 AM"
  },
  {
    lead_id: "9a8024de-0035-48c2-83f9-dc2a04df209f",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21560,
    creation_date_time: "07/04/2024",
    customer_name: "James Wilson",
    customer_phone_number: "(678) 222-1122",
    customer_email: "james.wilson@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Cancaled",
    lead_activity: "Company Canceled",
    next_action: "",

    sales_name: "Frank Delgado",
    is_new: true,

    estimator: "Frank Delgado",
    survey_date: "07/02/2024",
    survey_time: "08:15 AM"
  },
  {
    lead_id: "eb396780-0c8d-4eff-a6fa-0888f1196b66",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21561,
    creation_date_time: "07/04/2024",
    customer_name: "Olivia Clark",
    customer_phone_number: "(770) 333-4444",
    customer_email: "olivia.clark@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "Declined",
    lead_activity: "Service Not Needed",
    next_action: "",

    sales_name: "David Perry",
    is_new: false,

    estimator: "David Perry",
    survey_date: "07/02/2024",
    survey_time: "07:15 PM"
  },
  {
    lead_id: "aef53dea-b3e1-45d8-b2bb-866bb0cd039c",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21562,
    creation_date_time: "07/05/2024",
    customer_name: "David Miller",
    customer_phone_number: "(678) 909-1876",
    customer_email: "david.miller@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "Quoted",
    lead_activity: "Quote Follow Up",
    next_action: "Attempt 1",

    sales_name: "Gina Sanders",
    is_new: true,

    estimator: "Gina Sanders",
    survey_date: "07/03/2024",
    survey_time: "04:30 PM"
  },
  {
    lead_id: "4ab4744f-5c6f-42fe-b606-86f086bcc0a0",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21563,
    creation_date_time: "07/05/2024",
    customer_name: "Emma Anderson",
    customer_phone_number: "(404) 987-6543",
    customer_email: "emma.anderson@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Bad Lead",
    lead_activity: "Duplicate Lead",
    next_action: "",

    sales_name: "Cynthia Lin",
    is_new: false,

    estimator: "Cynthia Lin",
    survey_date: "07/03/2024",
    survey_time: "01:45 PM"
  },
  {
    lead_id: "ed070cde-ef29-45d1-b729-8fa66f5cabcc",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21564,
    creation_date_time: "07/06/2024",
    customer_name: "John Doe Jr.",
    customer_phone_number: "(678) 111-2233",
    customer_email: "john.doejr@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "Move on Hold",
    lead_activity: "",
    next_action: "",

    sales_name: "Frank Delgado",
    is_new: true,

    estimator: "Frank Delgado",
    survey_date: "07/04/2024",
    survey_time: "08:00 AM"
  },
  {
    lead_id: "dc639864-69d7-4f74-a997-fc3bdbcf8624",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21565,
    creation_date_time: "07/06/2024",
    customer_name: "Jane S. Smith",
    customer_phone_number: "(404) 555-0000",
    customer_email: "jane.s.smith@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "New Lead",
    lead_activity: "Contacting",
    next_action: "Attempt 1",

    sales_name: "Gina Sanders",
    is_new: false,

    estimator: "Gina Sanders",
    survey_date: "07/04/2024",
    survey_time: "06:30 PM"
  },
  {
    lead_id: "39bcaf32-c6bb-4efe-9ec4-5447194f94f0",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21566,
    creation_date_time: "07/07/2024",
    customer_name: "Michael J. Johnson",
    customer_phone_number: "(470) 555-1212",
    customer_email: "michael.j.johnson@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Bad Lead",
    lead_activity: "Invalid Contact",
    next_action: "",

    sales_name: "Alice Morgan",
    is_new: true,

    estimator: "Alice Morgan",
    survey_date: "07/05/2024",
    survey_time: "09:15 AM"
  },
  {
    lead_id: "91ac5b4a-689c-4781-91ff-bfa74ba1e494",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21567,
    creation_date_time: "07/07/2024",
    customer_name: "Emily R. Davis",
    customer_phone_number: "(770) 555-1111",
    customer_email: "emily.r.davis@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "In Progress",
    lead_activity: "In Home Estimate",
    next_action: "Schedule Survey",

    sales_name: "Brian White",
    is_new: false,

    estimator: "Brian White",
    survey_date: "07/05/2024",
    survey_time: "07:45 PM"
  },
  {
    lead_id: "97ff6956-e0eb-4e09-9a57-27a0699cc677",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21568,
    creation_date_time: "07/08/2024",
    customer_name: "Robert T. Brown",
    customer_phone_number: "(678) 999-0000",
    customer_email: "robert.t.brown@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "Booked",
    lead_activity: "Regular Booked",
    next_action: "",

    sales_name: "Brian White",
    is_new: true,

    estimator: "Brian White",
    survey_date: "07/06/2024",
    survey_time: "04:00 PM"
  },
  {
    lead_id: "d625e940-9fd9-4fa5-aef1-7091753ad6da",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21569,
    creation_date_time: "07/08/2024",
    customer_name: "Sophia M. Martinez",
    customer_phone_number: "(404) 222-3333",
    customer_email: "sophia.m.martinez@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "In Progress",
    lead_activity: "Virtual Estimate",
    next_action: "Schedule Survey",

    sales_name: "David Perry",
    is_new: false,

    estimator: "David Perry",
    survey_date: "07/06/2024",
    survey_time: "03:15 PM"
  },
  {
    lead_id: "78b12f24-9f4f-4d8a-9099-fa47208a9a1d",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21570,
    creation_date_time: "07/09/2024",
    customer_name: "James K. Wilson",
    customer_phone_number: "(678) 909-1876",
    customer_email: "james.k.wilson@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "Booked",
    lead_activity: "Booked on 1st Call",
    next_action: "",

    sales_name: "Gina Sanders",
    is_new: true,

    estimator: "Gina Sanders",
    survey_date: "07/07/2024",
    survey_time: "05:30 PM"
  },
  {
    lead_id: "6cc9d2fb-6ade-4ba4-aa7f-fdb21331cfda",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21571,
    creation_date_time: "07/09/2024",
    customer_name: "Olivia P. Clark",
    customer_phone_number: "(770) 123-1111",
    customer_email: "olivia.p.clark@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "Cancaled",
    lead_activity: "Customer Canceled",
    next_action: "",

    sales_name: "Cynthia Lin",
    is_new: false,

    estimator: "Cynthia Lin",
    survey_date: "07/07/2024",
    survey_time: "12:15 PM"
  },
  {
    lead_id: "61d8d4c0-f588-4632-a24b-26fb38568d2d",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21572,
    creation_date_time: "07/10/2024",
    customer_name: "David G. Miller",
    customer_phone_number: "(470) 999-9876",
    customer_email: "david.g.miller@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "In Progress",
    lead_activity: "Info Gathering",
    next_action: "Attempt 1",

    sales_name: "Alice Morgan",
    is_new: true,

    estimator: "Alice Morgan",
    survey_date: "07/08/2024",
    survey_time: "08:45 PM"
  },
  {
    lead_id: "13a05a1a-8380-4f77-977c-811eb2c01852",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21573,
    creation_date_time: "07/10/2024",
    customer_name: "Emma L. Anderson",
    customer_phone_number: "(404) 444-1212",
    customer_email: "emma.l.anderson@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "Declined",
    lead_activity: "Timing Conflict",
    next_action: "",

    sales_name: "Frank Delgado",
    is_new: false,

    estimator: "Frank Delgado",
    survey_date: "07/08/2024",
    survey_time: "07:00 AM"
  },
  {
    lead_id: "8898bce6-b53b-4bad-af3b-a60b6ee78180",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21574,
    creation_date_time: "07/11/2024",
    customer_name: "John D. Paul",
    customer_phone_number: "(678) 555-0001",
    customer_email: "john.d.paul@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "Bad Lead",
    lead_activity: "Spam",
    next_action: "",

    sales_name: "Brian White",
    is_new: true,

    estimator: "Brian White",
    survey_date: "07/09/2024",
    survey_time: "09:45 AM"
  },
  {
    lead_id: "7fa93f50-badf-4112-96c0-926de1487f52",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21575,
    creation_date_time: "07/11/2024",
    customer_name: "Jane W. Smith",
    customer_phone_number: "(404) 555-2345",
    customer_email: "jane.w.smith@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Quoted",
    lead_activity: "Negotiation",
    next_action: "Follow up 3",

    sales_name: "Erika Martinez",
    is_new: false,

    estimator: "Erika Martinez",
    survey_date: "07/09/2024",
    survey_time: "04:15 PM"
  },
  {
    lead_id: "bca34c78-d563-4887-bf2c-5dc7f8b7e72e",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21576,
    creation_date_time: "07/12/2024",
    customer_name: "Michael A. Jordan",
    customer_phone_number: "(470) 222-3333",
    customer_email: "michael.a.jordan@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "Declined",
    lead_activity: "Chose Competitor",
    next_action: "",

    sales_name: "David Perry",
    is_new: true,

    estimator: "David Perry",
    survey_date: "07/10/2024",
    survey_time: "08:00 PM"
  },
  {
    lead_id: "60ee6258-cdaa-4df7-86fd-6095da88e005",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21577,
    creation_date_time: "07/12/2024",
    customer_name: "Emily K. Davis",
    customer_phone_number: "(770) 567-7890",
    customer_email: "emily.k.davis@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "New Lead",
    lead_activity: "Contacting",
    next_action: "Attempt 1",

    sales_name: "Cynthia Lin",
    is_new: false,

    estimator: "Cynthia Lin",
    survey_date: "07/10/2024",
    survey_time: "02:30 PM"
  },
  {
    lead_id: "b6f04f20-16ff-4af9-9019-967af19b063f",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21578,
    creation_date_time: "07/13/2024",
    customer_name: "Robert L. Brown",
    customer_phone_number: "(678) 000-1111",
    customer_email: "robert.l.brown@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Cancaled",
    lead_activity: "Customer Canceled",
    next_action: "",

    sales_name: "Frank Delgado",
    is_new: true,

    estimator: "Frank Delgado",
    survey_date: "07/11/2024",
    survey_time: "10:30 AM"
  },
  {
    lead_id: "7ed7f508-7c4c-4b63-aa0d-c234c91b0aa7",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21579,
    creation_date_time: "07/13/2024",
    customer_name: "Sophia J. Martinez",
    customer_phone_number: "(404) 777-8888",
    customer_email: "sophia.j.martinez@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "In Progress",
    lead_activity: "Contacting",
    next_action: "Attempt 2",

    sales_name: "Alice Morgan",
    is_new: false,

    estimator: "Alice Morgan",
    survey_date: "07/11/2024",
    survey_time: "05:45 PM"
  },
  {
    lead_id: "00b1bc1b-d385-4b4a-9cb6-c1bb228809dd",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21580,
    creation_date_time: "07/14/2024",
    customer_name: "James R. Wilson",
    customer_phone_number: "(678) 999-2222",
    customer_email: "james.r.wilson@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "In Progress",
    lead_activity: "Virtual Estimate",
    next_action: "Schedule Survey",

    sales_name: "Brian White",
    is_new: true,

    estimator: "Brian White",
    survey_date: "07/12/2024",
    survey_time: "12:45 PM"
  },
  {
    lead_id: "32fa6aa2-dbfa-4cf6-b17e-46fb9332011a",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21581,
    creation_date_time: "07/14/2024",
    customer_name: "Olivia D. Clark",
    customer_phone_number: "(770) 444-5555",
    customer_email: "olivia.d.clark@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Bad Lead",
    lead_activity: "Duplicate Lead",
    next_action: "",

    sales_name: "Erika Martinez",
    is_new: false,

    estimator: "Erika Martinez",
    survey_date: "07/12/2024",
    survey_time: "07:30 PM"
  },
  {
    lead_id: "99533fbf-863d-4daf-bd19-d5700f202354",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21582,
    creation_date_time: "07/15/2024",
    customer_name: "David E. Miller",
    customer_phone_number: "(470) 111-7777",
    customer_email: "david.e.miller@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "Bad Lead",
    lead_activity: "Not Qulified",
    next_action: "",

    sales_name: "David Perry",
    is_new: true,

    estimator: "David Perry",
    survey_date: "07/13/2024",
    survey_time: "07:00 AM"
  },
  {
    lead_id: "b95ffbc4-61e4-489d-88bb-e680c0fadd03",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21583,
    creation_date_time: "07/15/2024",
    customer_name: "Emma T. Anderson",
    customer_phone_number: "(404) 888-9999",
    customer_email: "emma.t.anderson@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Booked",
    lead_activity: "Booked Online",
    next_action: "",

    sales_name: "Cynthia Lin",
    is_new: false,

    estimator: "Cynthia Lin",
    survey_date: "07/13/2024",
    survey_time: "09:30 AM"
  },
  {
    lead_id: "c405f42a-54a7-4809-a332-a7b24a6cf034",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21584,
    creation_date_time: "07/16/2024",
    customer_name: "John Q. Public",
    customer_phone_number: "(678) 555-2222",
    customer_email: "john.q.public@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "In Progress",
    lead_activity: "Info Gathering",
    next_action: "Attempt 5",

    sales_name: "Frank Delgado",
    is_new: true,

    estimator: "Frank Delgado",
    survey_date: "07/14/2024",
    survey_time: "08:00 PM"
  },
  {
    lead_id: "d68f8b6a-07f3-4aa7-8c46-fff944270b5b",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21585,
    creation_date_time: "07/16/2024",
    customer_name: "Jane L. Smythe",
    customer_phone_number: "(404) 666-7777",
    customer_email: "jane.l.smythe@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "New Lead",
    lead_activity: "Contacting",
    next_action: "Attempt 1",

    sales_name: "Gina Sanders",
    is_new: false,

    estimator: "Gina Sanders",
    survey_date: "07/14/2024",
    survey_time: "07:15 AM"
  },
  {
    lead_id: "bb13a65d-9076-4b30-bb52-c035ade7a2f8",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21586,
    creation_date_time: "07/17/2024",
    customer_name: "Michael V. Jenson",
    customer_phone_number: "(470) 333-8888",
    customer_email: "michael.v.jenson@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "Declined",
    lead_activity: "Pricing Issue",
    next_action: "",

    sales_name: "Alice Morgan",
    is_new: true,

    estimator: "Alice Morgan",
    survey_date: "07/15/2024",
    survey_time: "04:15 PM"
  },
  {
    lead_id: "f4262edb-1744-4977-a494-02cf6dc241b2",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21587,
    creation_date_time: "07/17/2024",
    customer_name: "Emily U. Davids",
    customer_phone_number: "(770) 999-0000",
    customer_email: "emily.u.davids@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "Quoted",
    lead_activity: "Negotiation",
    next_action: "Follow up 1",

    sales_name: "Brian White",
    is_new: false,

    estimator: "Brian White",
    survey_date: "07/15/2024",
    survey_time: "11:00 AM"
  },
  {
    lead_id: "ed6a888f-9df0-47c9-9372-1bb060b2d4fa",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21588,
    creation_date_time: "07/18/2024",
    customer_name: "Robert Z. Brown",
    customer_phone_number: "(678) 345-6789",
    customer_email: "robert.z.brown@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Quoted",
    lead_activity: "Quote Follow Up",
    next_action: "Follow up 4",

    sales_name: "Cynthia Lin",
    is_new: true,

    estimator: "Cynthia Lin",
    survey_date: "07/16/2024",
    survey_time: "02:30 PM"
  },
  {
    lead_id: "fbc15014-68c0-4db8-9df1-1493866295ef",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21589,
    creation_date_time: "07/18/2024",
    customer_name: "Sophia Y. Martinez",
    customer_phone_number: "(404) 222-9999",
    customer_email: "sophia.y.martinez@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "Cancaled",
    lead_activity: "Company Canceled",
    next_action: "",

    sales_name: "Erika Martinez",
    is_new: false,

    estimator: "Erika Martinez",
    survey_date: "07/16/2024",
    survey_time: "03:45 PM"
  },
  {
    lead_id: "77f138e3-3149-480b-bf6c-46c7a4e63ae1",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21590,
    creation_date_time: "07/19/2024",
    customer_name: "James H. Wilson",
    customer_phone_number: "(678) 101-2020",
    customer_email: "james.h.wilson@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Bad Lead",
    lead_activity: "Invalid Contact",
    next_action: "",

    sales_name: "David Perry",
    is_new: true,

    estimator: "David Perry",
    survey_date: "07/17/2024",
    survey_time: "10:00 AM"
  },
  {
    lead_id: "ed4b469a-1bf9-49f4-9aad-32f8c5eb15c1",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21591,
    creation_date_time: "07/19/2024",
    customer_name: "Olivia B. Clarke",
    customer_phone_number: "(770) 212-3434",
    customer_email: "olivia.b.clarke@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "Declined",
    lead_activity: "Service Not Needed",
    next_action: "",

    sales_name: "Gina Sanders",
    is_new: false,

    estimator: "Gina Sanders",
    survey_date: "07/17/2024",
    survey_time: "06:45 PM"
  },
  {
    lead_id: "5b4c3086-3bc1-49e4-9130-a37df5c08bdd",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21592,
    creation_date_time: "07/20/2024",
    customer_name: "David W. Milley",
    customer_phone_number: "(470) 454-5555",
    customer_email: "david.w.milley@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "Quoted",
    lead_activity: "Negotiation",
    next_action: "Follow up 1",

    sales_name: "Cynthia Lin",
    is_new: true,

    estimator: "Cynthia Lin",
    survey_date: "07/18/2024",
    survey_time: "07:30 PM"
  },
  {
    lead_id: "5fb06e47-0093-4c14-9faa-c8645f249d27",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21593,
    creation_date_time: "07/20/2024",
    customer_name: "Emma G. Anders",
    customer_phone_number: "(404) 121-1313",
    customer_email: "emma.g.anders@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "In Progress",
    lead_activity: "Virtual Estimate",
    next_action: "Schedule Survey",

    sales_name: "Brian White",
    is_new: false,

    estimator: "Brian White",
    survey_date: "07/18/2024",
    survey_time: "08:15 AM"
  },
  {
    lead_id: "8a7f9e0c-aef7-45f9-bfdb-78f7ef9dfd80",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21594,
    creation_date_time: "07/21/2024",
    customer_name: "John R. Doe",
    customer_phone_number: "(678) 222-3333",
    customer_email: "john.r.doe@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "New Lead",
    lead_activity: "Contacting",
    next_action: "Attempt 1",

    sales_name: "Erika Martinez",
    is_new: true,

    estimator: "Erika Martinez",
    survey_date: "07/19/2024",
    survey_time: "01:45 PM"
  },
  {
    lead_id: "b11db0d0-8d90-470a-bd86-5e437e26652e",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21595,
    creation_date_time: "07/21/2024",
    customer_name: "Jane A. Smithy",
    customer_phone_number: "(404) 999-8888",
    customer_email: "jane.a.smithy@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "Declined",
    lead_activity: "Pricing Issue",
    next_action: "",

    sales_name: "Alice Morgan",
    is_new: false,

    estimator: "Alice Morgan",
    survey_date: "07/19/2024",
    survey_time: "05:00 PM"
  },
  {
    lead_id: "6670a16e-1379-4e41-80f4-37ed5e19fcf5",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21596,
    creation_date_time: "07/22/2024",
    customer_name: "Michael X. Jon",
    customer_phone_number: "(470) 101-2021",
    customer_email: "michael.x.jon@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "In Progress",
    lead_activity: "Contacting",
    next_action: "Attempt 5",

    sales_name: "Frank Delgado",
    is_new: true,

    estimator: "Frank Delgado",
    survey_date: "07/20/2024",
    survey_time: "11:45 AM"
  },
  {
    lead_id: "de2e431b-edc1-4e64-9d1c-7f60059b9de0",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21597,
    creation_date_time: "07/22/2024",
    customer_name: "Emily O. Daves",
    customer_phone_number: "(770) 131-4141",
    customer_email: "emily.o.daves@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "Quoted",
    lead_activity: "Awaiting Decision",
    next_action: "Follow up 1",

    sales_name: "David Perry",
    is_new: false,

    estimator: "David Perry",
    survey_date: "07/20/2024",
    survey_time: "10:30 AM"
  },
  {
    lead_id: "814f7454-ccf1-4b0e-b9fd-2fcf48d25ad9",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21598,
    creation_date_time: "07/23/2024",
    customer_name: "Robert M. Browning",
    customer_phone_number: "(678) 555-1313",
    customer_email: "robert.m.browning@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Declined",
    lead_activity: "Service Not Needed",
    next_action: "",

    sales_name: "Gina Sanders",
    is_new: true,

    estimator: "Gina Sanders",
    survey_date: "07/21/2024",
    survey_time: "07:00 PM"
  },
  {
    lead_id: "7312ae0f-48d6-4c74-8c07-41dfefe45e52",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21599,
    creation_date_time: "07/23/2024",
    customer_name: "Sophia R. Martines",
    customer_phone_number: "(404) 141-5151",
    customer_email: "sophia.r.martines@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "Bad Lead",
    lead_activity: "Spam",
    next_action: "",

    sales_name: "Cynthia Lin",
    is_new: false,

    estimator: "Cynthia Lin",
    survey_date: "07/21/2024",
    survey_time: "02:00 PM"
  },
  {
    lead_id: "ee4ea6b5-c56f-435f-8411-c0b0c8022f3b",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21600,
    creation_date_time: "07/24/2024",
    customer_name: "James O. Wilsen",
    customer_phone_number: "(678) 909-1876",
    customer_email: "james.o.wilsen@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Booked",
    lead_activity: "Booked Online",
    next_action: "",

    sales_name: "Brian White",
    is_new: true,

    estimator: "Brian White",
    survey_date: "07/22/2024",
    survey_time: "12:00 PM"
  },
  {
    lead_id: "5e3821a8-a01a-40fd-a026-96bd9ad3ffa2",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21601,
    creation_date_time: "07/24/2024",
    customer_name: "Olivia F. Clarks",
    customer_phone_number: "(770) 232-4343",
    customer_email: "olivia.f.clarks@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Google",

    lead_status: "Quoted",
    lead_activity: "Quote Follow Up",
    next_action: "Follow up 4",

    sales_name: "Alice Morgan",
    is_new: false,

    estimator: "Alice Morgan",
    survey_date: "07/22/2024",
    survey_time: "08:30 AM"
  },
  {
    lead_id: "fcc1fcb5-0110-4b83-87d1-80c0e174fb0b",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21602,
    creation_date_time: "07/25/2024",
    customer_name: "David Q. Millers",
    customer_phone_number: "(470) 242-5252",
    customer_email: "david.q.millers@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Instagram",

    lead_status: "Declined",
    lead_activity: "Chose Competitor",
    next_action: "",

    sales_name: "Gina Sanders",
    is_new: true,

    estimator: "Gina Sanders",
    survey_date: "07/23/2024",
    survey_time: "01:00 PM"
  },
  {
    lead_id: "66c626e9-179b-4fa4-9094-c70ddd7d9470",
    tenant_id: "tenant_1",
    company_name: "Zip Moving",
    job_number: 21603,
    creation_date_time: "07/25/2024",
    customer_name: "Emma H. Andersen",
    customer_phone_number: "(404) 252-6262",
    customer_email: "emma.h.andersen@example.com",
    rate_type: "Hourly Rate",
    service_type: "Moving",
    source: "Yelp",

    lead_status: "In Progress",
    lead_activity: "In Home Estimate",
    next_action: "Schedule Survey",

    sales_name: "Erika Martinez",
    is_new: false,

    estimator: "Erika Martinez",
    survey_date: "07/23/2024",
    survey_time: "07:45 PM"
  }
];

export default actualLeads;
