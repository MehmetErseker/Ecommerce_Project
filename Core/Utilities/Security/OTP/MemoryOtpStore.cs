using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Utilities.Security.OTP
{
    public class MemoryOtpStore : IOtpStore
    {
        private readonly IMemoryCache _cache;
        private static readonly object _lock = new();

        public MemoryOtpStore(IMemoryCache cache) => _cache = cache;

        public void Save(OtpEntry entry, TimeSpan ttl)
        {
            var options = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl,
                SlidingExpiration = null
            };
            _cache.Set(entry.TicketId, entry, options);
        }

        public bool TryGet(string ticketId, out OtpEntry entry)
        {
            return _cache.TryGetValue(ticketId, out entry);
        }

        public void Remove(string ticketId)
        {
            _cache.Remove(ticketId);
        }

        public bool TryIncrementAttempt(string ticketId, int maxAttempts, out OtpEntry entry)
        {
            lock (_lock)
            {
                if (!_cache.TryGetValue(ticketId, out entry)) return false;
                entry.Attempts++;
                if (entry.Attempts > maxAttempts)
                {
                    _cache.Remove(ticketId);
                    return false;
                }
                _cache.Set(ticketId, entry, new MemoryCacheEntryOptions
                {
                    AbsoluteExpiration = entry.ExpiresAt
                });
                return true;
            }
        }
    }
}
