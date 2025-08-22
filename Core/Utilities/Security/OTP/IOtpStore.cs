using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Utilities.Security.OTP
{
    public interface IOtpStore
    {
        void Save(OtpEntry entry, TimeSpan ttl);
        bool TryGet(string ticketId, out OtpEntry entry);
        void Remove(string ticketId);
        bool TryIncrementAttempt(string ticketId, int maxAttempts, out OtpEntry entry);
    }
}
