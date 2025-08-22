// Business/Concrete/OtpService.cs
using Business.Abstract;
using Core.Utilities.Security.OTP;
using Entities.Concrete;
using Entities.DTOs;
using System.Security.Cryptography;
using System.Text;

public class OtpService : IOtpService
{
    IOtpStore _store;

    // config
    private const int OtpDigits = 6;

    public OtpService(IOtpStore store)
    {
        _store = store;
    }

    public OtpTicket CreateTicketFor(User user, TimeSpan ttl, int maxAttempts)
    {
        var code = GenerateNumericCode(OtpDigits);
        var ticketId = GenerateTicketId(user.Id);

        var entry = new OtpEntry
        {
            TicketId = ticketId,
            UserId = user.Id,
            Code = code,
            ExpiresAt = DateTime.UtcNow.Add(ttl),
            Attempts = 0
        };



        _store.Save(entry, ttl);

        
        
        Console.WriteLine($"[DEV OTP] User: {user.Email}, Code: {code}");
        

        return new OtpTicket
        {
            TicketId = ticketId,
            ExpiresAt = entry.ExpiresAt,
            CodeDevOnly = code // sadece dev/test amaçlı; prod’da kullanıcıya göstermeyin
        };
    }

    public bool Validate(string ticketId, string otp, out int userId)
    {
        userId = 0;

        if (!_store.TryGet(ticketId, out var entry))
            return false;

        // Süre kontrolü
        if (DateTime.UtcNow > entry.ExpiresAt)
        {
            _store.Remove(ticketId);
            return false;
        }

        // attempt sayısını güvenli artır
        if (!_store.TryIncrementAttempt(ticketId, maxAttempts: 5, out entry))
            return false;

        // zaman sabitliğinde karşılaştırma (temel)
        if (!FixedTimeEquals(entry.Code, otp))
            return false;

        // Tek kullanımlık
        _store.Remove(ticketId);
        userId = entry.UserId;
        return true;
    }

    private static string GenerateNumericCode(int digits)
    {
        // 10^digits aralığında kripto-güçlü sayi
        var bytes = new byte[4];
        RandomNumberGenerator.Fill(bytes);
        uint value = BitConverter.ToUInt32(bytes, 0) % (uint)Math.Pow(10, digits);
        return value.ToString(new string('0', digits));
    }

    private static string GenerateTicketId(int userId)
    {
        // benzersiz bir id
        var guid = Guid.NewGuid().ToString("N");
        return $"{userId}-{guid}";
    }

    private static bool FixedTimeEquals(string a, string b)
    {
        if (a == null || b == null || a.Length != b.Length) return false;
        int diff = 0;
        for (int i = 0; i < a.Length; i++) diff |= a[i] ^ b[i];
        return diff == 0;
    }
}

