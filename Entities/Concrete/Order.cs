using Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Concrete
{
    public class Order:IEntity
    {   public int Id { get; set; }
        public int UserId { get; set; }
        public List<OrderDetail> OrderDetails { get; set; }
        public DateTime Date { get; set; }
        public decimal TotalPrice { get; set; }
        public string OrderStatus { get; set; }
    }
}
