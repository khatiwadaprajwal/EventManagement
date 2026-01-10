// import request from 'supertest';
// import app from '../../src/app';

// describe('POST /bookings (Lock Seats)', () => {
//     let authToken: string;
//     let targetEventId = 6; 
//     let seatIdsToLock: number[] = [];

    
//     const testUser = {
//         email: `letstest${Date.now()}@example.com`,
//         password: "justfortest", 
//         name: "Jest Tester"
//     };

//     beforeAll(async () => {
//         // 1. REGISTER USER
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

       
//         authToken = loginRes.body.token || loginRes.body.data?.token;

       
//         const eventRes = await request(app).get(`/v1/events/${targetEventId}`);
//         const seats = eventRes.body.data?.event?.seats || eventRes.body.event?.seats || [];
        
       
//         const availableSeats = seats.filter((s: any) => s.status === 'AVAILABLE');

//         if (availableSeats.length < 2) {
//             console.warn("⚠️ Not enough available seats. Tests might fail.");
//             seatIdsToLock = [101, 102]; // Fallback
//         } else {
//             seatIdsToLock = [availableSeats[0].id, availableSeats[1].id];
//             console.log("✅ Using Real Seat IDs:", seatIdsToLock);
//         }
//     });

//     // TEST 1: SUCCESS (Expect 201)
//     it('should lock seats and return 201 Created', async () => {
//         const payload = {
//             eventId: targetEventId,
//             seatIds: seatIdsToLock
//         };

//         const res = await request(app)
//             .post('/v1/bookings')
//             .set('Authorization', `Bearer ${authToken}`)
//             .send(payload);

        
//         if (res.status !== 201) {
//             console.log("❌ Booking Failed:", JSON.stringify(res.body, null, 2));
//         }

//         expect(res.status).toBe(201);
        
   
//         expect(res.body).toHaveProperty('data');
//         expect(res.body.data).toHaveProperty('booking');
//         expect(res.body.data.booking.status).toBe('PENDING');
//         expect(res.body.data.seats).toHaveLength(2);
//     });

   
//     it('should return 409 if seats are already locked', async () => {
//         const payload = {
//             eventId: targetEventId,
//             seatIds: seatIdsToLock // Trying to book the SAME seats
//         };

//         const res = await request(app)
//             .post('/v1/bookings')
//             .set('Authorization', `Bearer ${authToken}`)
//             .send(payload);

//         expect(res.status).toBe(409);
        
//     });
// });