// import request from 'supertest';
// import app from '../../src/app';

// describe('Concurrency Test: The "Taylor Swift" Scenario', () => {
//     let authToken: string;
//     let targetEventId = 6; 
//     let targetSeatId: number;

//     const testUser = {
//         email: `concurrent_${Date.now()}@test.com`,
//         password: "Password123!",
//         name: "Speedy Tester"
//     };

//     beforeAll(async () => {
//         // ---------------------------------------------------------
//         // 1. ROBUST SIGNUP (Try /signup, fallback to /register)
//         // ---------------------------------------------------------
//         let authRes = await request(app).post('/v1/auth/signup').send(testUser);
//         if (authRes.status === 404) {
//              authRes = await request(app).post('/v1/auth/register').send(testUser);
//         }

        
//         const loginRes = await request(app)
//             .post('/v1/auth/login')
//             .send({
//                 email: testUser.email,
//                 password: testUser.password
//             });

       
//         if (loginRes.status !== 200) {
//             console.error("❌ Login Failed inside Concurrency Test:", loginRes.body);
//             throw new Error("Login failed, cannot run concurrency test");
//         }

//         authToken = loginRes.body.token || loginRes.body.data?.token;

//         if (!authToken) {
//             throw new Error("Token is missing from login response");
//         }

//         // ---------------------------------------------------------
//         // 3. FIND A FREE SEAT
//         // ---------------------------------------------------------
//         const eventRes = await request(app).get(`/v1/events/${targetEventId}`);
//         const seats = eventRes.body.data?.event?.seats || eventRes.body.event?.seats || [];
//         const freeSeat = seats.find((s: any) => s.status === 'AVAILABLE');

//         if (!freeSeat) {
//             console.warn("⚠️ No free seats available. Test will fail.");
            
//             targetSeatId = 9999; 
//         } else {
//             targetSeatId = freeSeat.id;
//             console.log(`🔥 Testing Race Condition on Seat ID: ${targetSeatId}`);
//         }
//     });

//     it('should allow only ONE booking when 20 users click simultaneously', async () => {
        
//         const TOTAL_REQUESTS = 20; 

//         // 1. Create an array of identical requests
//         const requestPromises = [];
//         for (let i = 0; i < TOTAL_REQUESTS; i++) {
//             const req = request(app)
//                 .post('/v1/bookings')
//                 .set('Authorization', `Bearer ${authToken}`)
//                 .send({
//                     eventId: targetEventId,
//                     seatIds: [targetSeatId] 
//                 });
//             requestPromises.push(req);
//         }

//         // 2. Fire them all at once
//         console.log(`🚀 Firing ${TOTAL_REQUESTS} concurrent requests...`);
//         const responses = await Promise.all(requestPromises);

//         // 3. Analyze Results
//         let successCount = 0;
//         let conflictCount = 0;
//         let otherErrorCount = 0;

//         responses.forEach((res, index) => {
//             if (res.status === 201) {
//                 successCount++;
//             } else if (res.status === 409) {
//                 conflictCount++;
//             } else {
//                 otherErrorCount++;
               
//                 if (otherErrorCount === 1) {
//                     console.log(`❌ Unexpected Error (Req ${index}):`, res.status, res.body);
//                 }
//             }
//         });

//         console.log(`📊 Results: Success=${successCount}, Conflicts=${conflictCount}, Errors=${otherErrorCount}`);

//         // 4. Assertions
//         // If otherErrorCount > 0, it means we hit a Rate Limiter (429) or Server Error (500)
//         expect(otherErrorCount).toBe(0);

//         // CRITICAL: Only EXACTLY 1 should succeed
//         expect(successCount).toBe(1); 
        
//         // The rest should be 409 (Conflict)
//         expect(conflictCount).toBe(TOTAL_REQUESTS - 1);
//     }, 30000); 
// });