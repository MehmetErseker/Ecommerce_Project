using Core.Utilities.Results;
using Entities.Concrete;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IOrderService
    {
        Task<IDataResult<List<OrderDto>>> GetAll();
        Task<IDataResult<List<OrderDto>>> GetOrdersByUserId(int userId);
        Task<IDataResult<OrderDto>> GetById(int orderId);
        Task<IResult> Add(Order order);
        Task<IResult> Update(Order order);
        Task<IResult> Delete(int orderId);
    }
}
