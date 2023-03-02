import http from 'k6/http';
import { check } from 'k6';
import { scenario } from 'k6/execution';

export const options = {
    scenarios: {
        petclinic: {
            executor: 'ramping-arrival-rate',

            // Our test with at a rate of `startRate` iterations started per `timeUnit` (e.g second).
            startRate: 10,

            // It should start `startRate` iterations per `timeUnit`
            timeUnit: '1s',

            // It should preallocate `preAllocatedVUs` VUs before starting the test.
            preAllocatedVUs: 1000,

            // It is allowed to spin up to `maxVUs` maximum VUs in order to sustain the defined
            // constant arrival rate.
            maxVUs: 10000,

            stages: [
                // It should stay at `target` iterations per `timeUnit` for the following `duration`.
                { target: 10, duration: '20s' },

                // It should linearly ramp-up to 'target' iterations per `timeUnit` over the following `duration`.
                { target: 100, duration: '1m' },

                // It should stay at `target` iterations per `timeUnit` for the following `duration`.
                { target: 100, duration: '1m' },

                // It should linearly ramp-up to 'target' iterations per `timeUnit` over the following `duration`.
                { target: 110, duration: '1m' },

                // It should stay at `target` iterations per `timeUnit` for the following `duration`.
                { target: 110, duration: '1m' },

                // It should linearly ramp-up to 'target' iterations per `timeUnit` over the following `duration`.
                { target: 120, duration: '1m' },

                // It should stay at `target` iterations per `timeUnit` for the following `duration`.
                { target: 120, duration: '1m' },

                // It should linearly ramp-up to 'target' iterations per `timeUnit` over the following `duration`.
                { target: 130, duration: '1m' },

                // It should stay at `target` iterations per `timeUnit` for the following `duration`.
                { target: 130, duration: '1m' },

                // It should linearly ramp-up to 'target' iterations per `timeUnit` over the following `duration`.
                { target: 140, duration: '1m' },

                // It should stay at `target` iterations per `timeUnit` for the following `duration`.
                { target: 140, duration: '1m' },

                // It should linearly ramp-up to 'target' iterations per `timeUnit` over the following `duration`.
                { target: 150, duration: '1m' },

                // It should stay at `target` iterations per `timeUnit` for the following `duration`.
                { target: 150, duration: '1m' },

                // It should linearly ramp-down to 'target' iterations per `timeUnit` over the following `duration`.
                { target: 0, duration: '1m' },
            ],
        },
    },
};

export default function () {
    const params = {
        timeout: '5s',
    };
    const res = http.get('http://localhost:8080/owners/find', params);
    check(res, { 'owners/find 0 status was 200': (r) => r.status === 200 });

    const res2 = http.get('http://localhost:8080/owners/new', params);
    check(res2, { 'owners/new get status was 200': (r) => r.status === 200 });

    const newOwnerUrl = 'http://localhost:8080/owners/new';
    const surname = `Surname${scenario.iterationInTest}a`
    const payload = `firstName=Name&lastName=${surname}&address=Address&city=City&telephone=12345`
    const res3 = http.post(newOwnerUrl, payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: '5s'
    })
    check(res3, { 'owners/new post status was 200': (r) => r.status === 200 });
    const newOwnerId = res3.url.split('/').slice(-1)[0]

    const res4 = http.get(http.url`http://localhost:8080/owners/${newOwnerId}/pets/new`, params);
    check(res4, { 'pets/new get status was 200': (r) => r.status === 200 });

    const petPayload = 'id=&name=Name&birthDate=2020-01-01&type=bird'
    const res5 = http.post(http.url`http://localhost:8080/owners/${newOwnerId}/pets/new`, petPayload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: '5s'
    })
    check(res5, { 'owners/new post status was 200': (r) => r.status === 200 });
    const doc = res5.html();

    const petId = doc
        .find('a')
        .toArray()
        .slice(-1)[0]
        .attr('href')
        .split('/')
        .slice(-3)[0]

    const res6 = http.get(http.url`http://localhost:8080/owners/${newOwnerId}/pets/${petId}/visits/new`, params);
    check(res6, { 'visits/new get status was 200': (r) => r.status === 200 });

    const visitPayload = `date=2023-03-02&description=Description&petId=${petId}`
    const res7 = http.post(http.url`http://localhost:8080/owners/${newOwnerId}/pets/${petId}/visits/new`, visitPayload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: '5s'
    })
    check(res7, { 'visits/new post status was 200': (r) => r.status === 200 });

    const res8 = http.get('http://localhost:8080/owners/find', params);
    check(res8, { 'owners/find 1 status was 200': (r) => r.status === 200 });

    const res9 = http.get(http.url`http://localhost:8080/owners?lastName=${surname}`, params);
    check(res9, { 'owners/find 2 status was 200': (r) => r.status === 200 });
}
