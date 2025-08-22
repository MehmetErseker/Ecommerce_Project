using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.DTOs
{
    public class OtpTicket
    {
        public string TicketId { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string CodeDevOnly { get; set; }
    }
}
