require("dotenv").config();
const mongoose = require("mongoose");
const FormSchema = require("../models/FormSchema");
const exampleSchema = require("../lib/exampleFormSchema");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  await FormSchema.findOneAndUpdate({ formId: exampleSchema.formId }, exampleSchema, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log(`Seeded form: ${exampleSchema.formId}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});