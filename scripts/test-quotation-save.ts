
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Define minimal schema for testing
const QuotationSchema = new mongoose.Schema({
    title: String,
    days: Array,
    pricingOptions: Object,
    versionHistory: Array,
    currentVersion: Number,
    isDraft: Boolean,
    itineraryId: String
}, { strict: false });

const Quotation = mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema);

async function testSave() {
    console.log('Connecting to DB...');
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI not found');
    }
    await mongoose.connect(process.env.MONGODB_URI);

    try {
        // 1. Create a dummy quotation
        console.log('Creating dummy quotation...');
        const initialQuotation = await Quotation.create({
            title: 'Test Quotation',
            days: [],
            versionHistory: [{
                versionNumber: 1,
                state: { title: 'Test Quotation' },
                isDraft: true
            }],
            currentVersion: 1,
            itineraryId: new mongoose.Types.ObjectId()
        });
        console.log('Created:', initialQuotation._id);

        // 2. Simulate API Call to /save with NEW payload
        const payload = {
            title: 'Updated Title',
            pricingOptions: { markupType: 'fixed', markupValue: 100 }
        };

        console.log('Simulating Save API call logic...');

        // Logic from the API route:
        const q = await Quotation.findById(initialQuotation._id);
        if (!q) throw new Error('Quotation not found');

        // Update fields
        q.title = payload.title;
        q.pricingOptions = payload.pricingOptions;

        // Update version history
        const vIndex = q.versionHistory.findIndex((v: any) => v.versionNumber === q.currentVersion);
        q.versionHistory[vIndex].state = {
            title: q.title,
            pricingOptions: q.pricingOptions
        };
        q.isDraft = false;
        q.markModified('versionHistory');

        await q.save();
        console.log('Save completed.');

        // 3. Verify Persistence
        const verif = await Quotation.findById(initialQuotation._id);
        console.log('Verifying...');
        console.log('Title in DB:', verif.title);
        console.log('Title in Version History:', verif.versionHistory[0].state.title);

        if (verif.title === 'Updated Title' && verif.versionHistory[0].state.title === 'Updated Title') {
            console.log('SUCCESS: Data persisted correctly in both doc and history.');
        } else {
            console.error('FAILURE: Data mismatch.');
        }

        // Cleanup
        await Quotation.deleteOne({ _id: initialQuotation._id });
        console.log('Cleanup done.');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

testSave();
