using AutoMapper;
using Business.Abstract;
using Business.Constants;
using Core.Utilities.Results;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using Entities.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.Concrete
{
    public class OrderManager : IOrderService
    {
        private readonly IOrderDal _orderDal;
        private readonly IMapper _mapper;
        public OrderManager(IOrderDal orderDal, IMapper mapper)
        {
            _orderDal = orderDal;
            _mapper = mapper;
        }

        public Task<IResult> Add(Order order)
        {
            throw new NotImplementedException();
        }

        public async Task<IResult> Delete(int orderId)
        {
            var order = await _orderDal.Get(c => c.Id == orderId);
            if (order == null)
            {
                return new ErrorResult(Messages.CategoryNotFound);
            }

            await _orderDal.Delete(order);
            return new SuccessResult(Messages.OrderDeleted);
        }

        public async Task<IDataResult<List<OrderDto>>> GetAll()
        {
    
            var orders = await _orderDal.GetAllItems();
            var ordersDto = _mapper.Map<List<OrderDto>>(orders);
            if (ordersDto == null || !ordersDto.Any())
            {
                return new ErrorDataResult<List<OrderDto>>(Messages.OrderNotFound);
            }

            return new SuccessDataResult<List<OrderDto>>(ordersDto, Messages.OrdersListed);
        }
        //getorderbyuserid ekle
        public async Task<IDataResult<OrderDto>> GetById(int orderId)
        {
            var orderEntity = await _orderDal.GetOrderByIdWithItems(orderId);
            var orderDto = _mapper.Map<OrderDto>(orderEntity);
            return new SuccessDataResult<OrderDto>(orderDto, Messages.OrderListed);
        }

        public Task<IResult> Update(Order order)
        {
            throw new NotImplementedException();
        }

        public async Task<IDataResult<List<OrderDto>>> GetOrdersByUserId(int userId)
        {
            var orderEntity = await _orderDal.GetOrdersByUserId(userId);
            var orderDto = _mapper.Map<List<OrderDto>>(orderEntity);
            //if (orders == null || !orders.Any())
            //{
            //    return new ErrorDataResult<List<OrderDto>>(Messages.OrderNotFound);
            //}
            return new SuccessDataResult<List<OrderDto>>(orderDto, Messages.OrdersListed);
        }
    }
}
