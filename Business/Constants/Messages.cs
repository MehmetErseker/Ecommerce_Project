using Core.Entities.Concrete;
using Core.Utilities.Security.JWT;
using Entities.Concrete;
using Entities.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.Constants
{
    public static class Messages
    {
        public static string ProductAdded = "Ürün eklendi";
        public static string CategoryAdded = "Kategori eklendi";
        public static string UserAdded = "Kullanıcı eklendi";
        public static string AddressAdded = "Adres eklendi";
        public static string ProductNameInvalid = "Ürün ismi geçersiz";
        public static string MaintenanceTime = "Bu saatte işlem geçersiz";
        public static string ProductsListed = "Ürünler listelendi";
        public static string CategoriesListed = "Kategoriler listelendi";
        public static string UsersListed = "Kullanıcılar listelendi";
        public static string UserHardDeleted = "Kullanıcı tamamen silindi";
        public static string AllUsersListed = "Bütün Kullanıcılar listelendi (silinmişler dahil)";
        public static string ProductDeleted = "Ürün silindi";
        public static string CategoryDeleted = "Kategori silindi";
        public static string AddressDeleted = "Adres silindi";
        public static string UserDeleted = "Kullanıcı silindi";
        public static string ProductUpdated = "Ürün güncellendi";
        public static string CategoryUpdated = "Kategori güncellendi";
        public static string UserUpdated = "Kullanıcı güncellendi";
        public static string AddressUpdated = "Adres güncellendi";
        public static string UserNotFound = "Kullanıcı bulunamadı";
        public static string AddressesListed = "Adresler listelendi";
        public static string ProductNotFound = "Ürün bulunamadı";
        public static string CategoryNotFound = "Kategori bulunamadı";
        public static string AddressNotFound = "Adres bulunamadı";
        public static string CartNotFound = "Sepet bulunamadı";
        public static string CartListed = "Sepet listelendi";
        public static string ItemAddedToCart = "Ürün sepete eklendi";
        public static string ItemRemovedFromCart= "Ürün sepetten kaldırıldı";
        public static string ItemNotFoundInCart= "Ürün sepet içinde bulunamadı";
        public static string CartFound = "Sepet bulundu";
        public static string CartCreated= "Sepet oluşturuldu";
        public static string CartDeleted = "Sepet silindi";
        public static string CartsListed = "Sepetler listelendi";
        public static string AuthorizationDenied = "Yetkiniz yok";
        public static string UserRegistered= "Kullanıcı kaydedildi";
        public static string PasswordError = "Hatalı şifre";
        public static string SuccessfulLogin = "Giriş Başarılı";
        public static string UserAlreadyExists= "Kullanıcı zaten mevcut";
        public static string AccessTokenCreated = "Erişim jetonu oluşturuldu";
        public static string NoClaimsFound = "Hiç bir yetki bulunamadı";
        public static string ClaimsListed = "Yetkiler listelendi";
        public static string OtpSent = "OTP gönderildi";
        public static string OtpInvalid = "Geçersiz OTP";
        public static string UserNotActive = "Kullanıcı aktif değil";
        public static string InsufficientStock = "Yetersiz stok";
        public static string CartIsEmpty = "Sepet boş";
        public static string OrderCompleted = "Sipariş tamamlandı";
        public static string OrderNotFound = "Sipariş bulunamadı";
        public static string OrdersListed= "Siparişler listelendi";
        public static string OrderListed = "Sipariş listelendi";
        public static string OrderDeleted = "Sipariş silindi";
        public static string ProductListedByCategory = "Ürünler kategoriye göre listelendi";
    }
}
