import _ from 'lodash';
import ResponseParser from '../response_parser';

describe('influxdb response parser', () => {
  const parser = new ResponseParser();

  describe('SHOW TAG response', () => {
    var query = 'SHOW TAG KEYS FROM "cpu"';
    var response = {
      results: [
        {
          series: [
            {
              name: 'cpu',
              columns: ['tagKey'],
              values: [['datacenter'], ['hostname'], ['source']],
            },
          ],
        },
      ],
    };

    var result = parser.parse(query, response);

    it('expects three results', () => {
      expect(_.size(result)).toBe(3);
    });
  });

  describe('SHOW TAG VALUES response', () => {
    var query = 'SHOW TAG VALUES FROM "cpu" WITH KEY = "hostname"';

    describe('response from 0.10.0', () => {
      var response = {
        results: [
          {
            series: [
              {
                name: 'hostnameTagValues',
                columns: ['hostname'],
                values: [['server1'], ['server2'], ['server2']],
              },
            ],
          },
        ],
      };

      var result = parser.parse(query, response);

      it('should get two responses', () => {
        expect(_.size(result)).toBe(2);
        expect(result[0].text).toBe('server1');
        expect(result[1].text).toBe('server2');
      });
    });

    describe('response from 0.12.0', () => {
      var response = {
        results: [
          {
            series: [
              {
                name: 'cpu',
                columns: ['key', 'value'],
                values: [['source', 'site'], ['source', 'api']],
              },
              {
                name: 'logins',
                columns: ['key', 'value'],
                values: [['source', 'site'], ['source', 'webapi']],
              },
            ],
          },
        ],
      };

      var result = parser.parse(query, response);

      it('should get two responses', () => {
        expect(_.size(result)).toBe(3);
        expect(result[0].text).toBe('site');
        expect(result[1].text).toBe('api');
        expect(result[2].text).toBe('webapi');
      });
    });
  });

  describe('SHOW FIELD response', () => {
    var query = 'SHOW FIELD KEYS FROM "cpu"';
    describe('response from 0.10.0', () => {
      var response = {
        results: [
          {
            series: [
              {
                name: 'measurements',
                columns: ['name'],
                values: [['cpu'], ['derivative'], ['logins.count'], ['logs'], ['payment.ended'], ['payment.started']],
              },
            ],
          },
        ],
      };

      var result = parser.parse(query, response);
      it('should get two responses', () => {
        expect(_.size(result)).toBe(6);
      });
    });

    describe('response from 0.11.0', () => {
      var response = {
        results: [
          {
            series: [
              {
                name: 'cpu',
                columns: ['fieldKey'],
                values: [['value']],
              },
            ],
          },
        ],
      };

      var result = parser.parse(query, response);

      it('should get two responses', () => {
        expect(_.size(result)).toBe(1);
      });
    });
  });
});
