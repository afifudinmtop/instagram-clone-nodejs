-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 31, 2023 at 11:29 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `instagram-clone-nodejs`
--

-- --------------------------------------------------------

--
-- Table structure for table `comment`
--

CREATE TABLE `comment` (
  `id` int(11) NOT NULL,
  `uuid` text DEFAULT NULL,
  `user` text DEFAULT NULL,
  `post` text DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT current_timestamp(),
  `hapus` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comment`
--

INSERT INTO `comment` (`id`, `uuid`, `user`, `post`, `comment`, `ts`, `hapus`) VALUES
(1, 'eb008feb-92b1-44af-9164-390c943f66e5', '4523946c-897f-405d-b306-8584108681f6', 'f1f355b3-13d5-4817-8250-ec18f2d1db3c', 'tes komen bang', '2023-03-16 06:34:31', NULL),
(2, 'cb0ee4b1-652e-4cc0-b26b-6268dc4b9a57', '3955dd0e-c436-452c-8a17-a338e0814e0d', 'f1f355b3-13d5-4817-8250-ec18f2d1db3c', 'ini user 3 komen ya', '2023-03-16 07:12:35', 'hapus'),
(3, 'c57d5cbb-cd3f-40a6-859d-7c5b9cb9478c', '3955dd0e-c436-452c-8a17-a338e0814e0d', '0c32003d-19f5-4969-9da2-185b74abd35b', 'nice one right?', '2023-03-16 13:24:21', 'hapus'),
(4, '3c31cc2f-c345-450e-b6a9-b87c09415026', '4523946c-897f-405d-b306-8584108681f6', 'ab88969f-853f-4b41-8d2f-0acd37ce828b', 'nice', '2023-03-24 02:25:19', NULL),
(5, 'a81258af-448c-46e2-b974-6db3f2411077', '4523946c-897f-405d-b306-8584108681f6', 'a88825e5-1894-48ef-9ada-5cb91e670553', 'brr', '2023-03-24 02:38:12', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `dm`
--

CREATE TABLE `dm` (
  `id` int(11) NOT NULL,
  `uuid` text DEFAULT NULL,
  `user` text DEFAULT NULL,
  `target` text DEFAULT NULL,
  `chat` text DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dm`
--

INSERT INTO `dm` (`id`, `uuid`, `user`, `target`, `chat`, `ts`) VALUES
(1, '8b2f069f-4353-4092-99bd-791dd0812ed3', '3955dd0e-c436-452c-8a17-a338e0814e0d', '002c5519-a693-4ef3-80eb-5fc8f9d2c951', 'tes1 ya', '2023-03-31 07:30:38'),
(2, '1668e25e-a8aa-4c6b-8fe6-dc2514b911c3', '002c5519-a693-4ef3-80eb-5fc8f9d2c951', '3955dd0e-c436-452c-8a17-a338e0814e0d', 'ok siap', '2023-03-31 08:06:49'),
(3, 'be9148ae-4614-4411-8ca0-8d2603e28ed2', '3955dd0e-c436-452c-8a17-a338e0814e0d', '002c5519-a693-4ef3-80eb-5fc8f9d2c951', 'woke ajdnawd ahdaw ad awj ajbdhawbdhawd awjhda dahwdbawh dahdaw djaw', '2023-03-31 08:26:38'),
(4, '4d6cebf8-f7d4-48cd-a479-77dc7dc9236d', '3955dd0e-c436-452c-8a17-a338e0814e0d', '4523946c-897f-405d-b306-8584108681f6', 'cek cek', '2023-03-31 09:16:36');

-- --------------------------------------------------------

--
-- Table structure for table `following`
--

CREATE TABLE `following` (
  `id` int(11) NOT NULL,
  `uuid` text DEFAULT NULL,
  `user` text DEFAULT NULL,
  `following` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `following`
--

INSERT INTO `following` (`id`, `uuid`, `user`, `following`) VALUES
(3, '1906d00d-f97d-4a53-8b8a-1ad8d78d2af2', '3955dd0e-c436-452c-8a17-a338e0814e0d', '002c5519-a693-4ef3-80eb-5fc8f9d2c951'),
(6, 'd5885ebd-17ba-4f46-b45e-b467f341cc7f', '4523946c-897f-405d-b306-8584108681f6', '3955dd0e-c436-452c-8a17-a338e0814e0d'),
(7, 'c3850048-04c3-4f09-93a9-da2a2c7e2c08', '4523946c-897f-405d-b306-8584108681f6', '002c5519-a693-4ef3-80eb-5fc8f9d2c951'),
(8, '88a3ecfe-ba4a-4330-b3d2-86b475c1dd34', '002c5519-a693-4ef3-80eb-5fc8f9d2c951', '3955dd0e-c436-452c-8a17-a338e0814e0d'),
(9, 'becccfa3-6666-44d5-978c-f18d3d60fc95', '3955dd0e-c436-452c-8a17-a338e0814e0d', '4523946c-897f-405d-b306-8584108681f6');

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` int(11) NOT NULL,
  `uuid` text DEFAULT NULL,
  `user` text DEFAULT NULL,
  `post` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`id`, `uuid`, `user`, `post`) VALUES
(7, '3fe038d8-e1d0-426a-a7b8-32aaca988945', '3955dd0e-c436-452c-8a17-a338e0814e0d', 'd3cadce8-9a3c-4522-be26-71ac693dd102'),
(9, '48b52817-a8d2-4f67-8130-264e8a763e64', '4523946c-897f-405d-b306-8584108681f6', 'd3cadce8-9a3c-4522-be26-71ac693dd102'),
(10, '65c506ae-8ec6-4a4e-b381-58542f865966', '4523946c-897f-405d-b306-8584108681f6', '72e6d735-7d81-4caa-a4eb-c5a07d4a9580'),
(11, 'cc303500-c44a-429c-81be-427630bb3b60', '3955dd0e-c436-452c-8a17-a338e0814e0d', 'f1f355b3-13d5-4817-8250-ec18f2d1db3c'),
(12, '158add1d-b3b4-498f-a79d-fd9f45487843', 'e6f4e859-af47-4a81-9fee-fcb2810e18fb', '845dcadb-fcac-4479-8af2-bd8b74b44208'),
(13, '1bd46185-00c6-42e0-8e25-69783389fc86', '4523946c-897f-405d-b306-8584108681f6', 'ab88969f-853f-4b41-8d2f-0acd37ce828b'),
(14, 'e37ca57a-d500-44e3-8ca4-3a04b5f5e05f', '4523946c-897f-405d-b306-8584108681f6', 'a88825e5-1894-48ef-9ada-5cb91e670553');

-- --------------------------------------------------------

--
-- Table structure for table `post`
--

CREATE TABLE `post` (
  `id` int(11) NOT NULL,
  `uuid` text DEFAULT NULL,
  `user` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `caption` text DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT current_timestamp(),
  `hapus` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post`
--

INSERT INTO `post` (`id`, `uuid`, `user`, `image`, `caption`, `ts`, `hapus`) VALUES
(1, 'dc3058fd-42e4-4ff0-a4bc-3f96fd48c987', '3955dd0e-c436-452c-8a17-a338e0814e0d', 'a8d23ec9-969f-4135-8936-52eb5a3f26f5.jpeg', 'albion online', '2023-03-05 13:00:44', NULL),
(2, '0c32003d-19f5-4969-9da2-185b74abd35b', '3955dd0e-c436-452c-8a17-a338e0814e0d', 'd4e5f80f-6ce8-4a67-922d-7d341632afaa.jpg', 'japan view', '2023-03-05 13:35:37', NULL),
(3, '72e6d735-7d81-4caa-a4eb-c5a07d4a9580', '3955dd0e-c436-452c-8a17-a338e0814e0d', '9c18c537-2d06-4f7b-a1ea-fe53d35a2f2a.jpg', 'bird', '2023-03-06 02:32:01', NULL),
(4, '21ecb188-590e-46ce-9daf-27c59b76678d', '4523946c-897f-405d-b306-8584108681f6', '22ab1fda-d067-4570-aeb6-aaee07caf009.jpg', 'avatar aang', '2023-03-06 02:34:24', NULL),
(5, 'd3cadce8-9a3c-4522-be26-71ac693dd102', '4523946c-897f-405d-b306-8584108681f6', 'a7564675-d634-4f1e-9a76-5e1cc4d710f9.jpg', 'chill ya', '2023-03-06 02:35:04', NULL),
(6, 'f1f355b3-13d5-4817-8250-ec18f2d1db3c', '002c5519-a693-4ef3-80eb-5fc8f9d2c951', '26d90541-33ba-4046-9626-2f20b6ec60a3.jpg', 'me', '2023-03-06 07:35:55', NULL),
(7, '8bad2018-9671-462f-b501-9ff15c823482', '3955dd0e-c436-452c-8a17-a338e0814e0d', '72aa5dd4-179c-43f1-96bf-485c3134993b.jpg', 'nature', '2023-03-23 05:55:49', NULL),
(8, '41e59969-90c6-4617-b3ca-861e41581ab7', '3955dd0e-c436-452c-8a17-a338e0814e0d', '3afecff1-0a24-4a53-a703-4dea3c86f5c1.jpg', 'ice', '2023-03-23 05:56:18', NULL),
(9, 'c6c344cd-27ac-4440-9014-ecfb233f33d9', '3955dd0e-c436-452c-8a17-a338e0814e0d', '60f30b8f-5198-4c13-b486-55382828a249.jpg', 'beach', '2023-03-23 05:56:29', NULL),
(10, '0277b9a0-8fff-462e-b395-728f7c03de5d', '002c5519-a693-4ef3-80eb-5fc8f9d2c951', '8abc13f9-2514-433f-ac86-cacd2c9e5d5a.jpg', 'zxc', '2023-03-23 05:57:49', NULL),
(11, '5b5930bd-0f86-4167-8cc7-93243d2d6fdc', '002c5519-a693-4ef3-80eb-5fc8f9d2c951', 'd472cb6d-23f3-4296-94df-1aa90d45990b.jpg', 'mountain', '2023-03-23 05:58:29', NULL),
(12, 'a88825e5-1894-48ef-9ada-5cb91e670553', '002c5519-a693-4ef3-80eb-5fc8f9d2c951', '09e3f24c-f856-4902-94e6-88bc5928e2aa.jpg', 'brrr', '2023-03-23 05:58:51', NULL),
(13, '14f02c21-b212-4d69-9477-0c227d6b8833', '002c5519-a693-4ef3-80eb-5fc8f9d2c951', 'c033b7b3-d23c-4d28-985e-6062e3f052f0.jpg', 'ttttt', '2023-03-23 05:59:21', NULL),
(14, 'a04949d3-a5bd-4d74-a29d-38e9ec6de1c3', '002c5519-a693-4ef3-80eb-5fc8f9d2c951', 'dcffbb04-e851-41ea-83f2-d5e5035e31bd.jpg', 'nice', '2023-03-23 05:59:36', NULL),
(15, 'ab88969f-853f-4b41-8d2f-0acd37ce828b', '002c5519-a693-4ef3-80eb-5fc8f9d2c951', '17225c9f-5fef-4f72-a844-7e774d5bb38c.jpg', 'll', '2023-03-23 05:59:48', NULL),
(16, '8047916d-b973-4341-be7f-d6cb7879b0c7', 'e6f4e859-af47-4a81-9fee-fcb2810e18fb', 'ceea9385-7595-4f5c-8e55-f05b1349149e.jpg', '', '2023-03-23 06:02:51', NULL),
(17, 'a3609dd0-f0bf-4370-8f0b-d8ba08fb0623', 'e6f4e859-af47-4a81-9fee-fcb2810e18fb', '68a171b1-fb70-4692-956b-f109e6d08851.jpg', '', '2023-03-23 06:03:51', NULL),
(18, '9ab0e7cf-d328-43c8-8c50-39122a0905e7', 'e6f4e859-af47-4a81-9fee-fcb2810e18fb', 'dc96dd07-5f29-487e-8474-38b1a8929f5a.jpg', '', '2023-03-23 06:03:59', NULL),
(19, 'aef92e9a-4542-4a82-922c-8c137cb61c9d', 'e6f4e859-af47-4a81-9fee-fcb2810e18fb', '05b8ddf2-1c94-43af-a63b-e077a4577b9b.jpg', '', '2023-03-23 06:04:13', NULL),
(20, '2d4b072e-cb52-4f00-aa46-3bacada9e87c', 'e6f4e859-af47-4a81-9fee-fcb2810e18fb', 'd29b0e35-20f6-46e7-9e7c-8b295e896d14.jpg', '', '2023-03-23 06:04:25', NULL),
(21, '28ab1b64-8a77-4a14-bcbe-83eed04dfe07', 'e6f4e859-af47-4a81-9fee-fcb2810e18fb', '6023f3bc-cfb6-412f-902d-85297de857cd.jpg', '', '2023-03-23 06:04:39', NULL),
(22, '5e1a4e00-79f0-4b18-a694-727833b21895', 'e6f4e859-af47-4a81-9fee-fcb2810e18fb', 'fe3b23a1-1cc3-4de8-8acd-2b7a57624e4a.jpg', '', '2023-03-23 06:04:55', NULL),
(23, 'dc641350-bbd9-4c75-9640-143213e78d5f', 'e6f4e859-af47-4a81-9fee-fcb2810e18fb', '521de00d-4714-4e05-b074-7434c865308f.jpg', '', '2023-03-23 06:05:08', NULL),
(24, '845dcadb-fcac-4479-8af2-bd8b74b44208', 'e6f4e859-af47-4a81-9fee-fcb2810e18fb', '332657ff-deca-432a-9e6e-d3288ae343c8.jpg', '', '2023-03-23 06:05:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `saved`
--

CREATE TABLE `saved` (
  `id` int(11) NOT NULL,
  `uuid` text DEFAULT NULL,
  `user` text DEFAULT NULL,
  `post` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `saved`
--

INSERT INTO `saved` (`id`, `uuid`, `user`, `post`) VALUES
(1, '5170f140-c745-4c03-9419-3277d14391d6', '3955dd0e-c436-452c-8a17-a338e0814e0d', 'f1f355b3-13d5-4817-8250-ec18f2d1db3c');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `uuid` text DEFAULT NULL,
  `username` text DEFAULT NULL,
  `password` text DEFAULT NULL,
  `first_name` text DEFAULT NULL,
  `last_name` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `hapus` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `uuid`, `username`, `password`, `first_name`, `last_name`, `image`, `bio`, `hapus`) VALUES
(1, '151c0705-e7e5-4587-9c8a-c0dc0040dec7', 'apip', '$2a$10$YEXAt.mVdFeqigsgYtuepOKItsKVq7vb.qXNdC8gY9N7Hc8Y5Uyja', 'apip', 'udin', 'user.png', NULL, NULL),
(2, '002c5519-a693-4ef3-80eb-5fc8f9d2c951', 'apip2', '$2a$10$UDargiCNl30NRSxE51sRo.U6g20DFQTKZhjNS8IYddt0jqzjo2eCW', 'apip2', 'udin2', '76111697-45d6-4428-907e-a1652431719e.jpg', 'oi oi oi', NULL),
(3, '3955dd0e-c436-452c-8a17-a338e0814e0d', 'apip3', '$2a$10$b1gBumthObueZPN2ealff.PWep8JeuPVV1uI/OF1jdjdgwU66t.AW', 'apip3', 'udin3', '64423e72-fc02-437a-92e3-043b532520b1.jpg', 'coba2', NULL),
(4, '4523946c-897f-405d-b306-8584108681f6', 'apip4', '$2a$10$WHziIh2VifHSAxe1D7YD0eU/17HOW5ElbQ8UvZOcMPpBGPBU63j0a', 'apip4', 'udin4', '4d6298d6-f7eb-4dae-aba5-8828dd8d59f5.jpg', 'the last air-bender', NULL),
(5, 'e6f4e859-af47-4a81-9fee-fcb2810e18fb', 'romeo', '$2a$10$cp5XPJpCDiDHnX7n2.2O/epuL9rq6JvR9IKupZm3N93xkx0bglcNi', 'romeo', 'alexandro', '40bf3fac-f84b-4ccd-b81e-42c0e3515bc9.jpg', 'mantab', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comment`
--
ALTER TABLE `comment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dm`
--
ALTER TABLE `dm`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `following`
--
ALTER TABLE `following`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `saved`
--
ALTER TABLE `saved`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comment`
--
ALTER TABLE `comment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `dm`
--
ALTER TABLE `dm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `following`
--
ALTER TABLE `following`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `post`
--
ALTER TABLE `post`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `saved`
--
ALTER TABLE `saved`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
