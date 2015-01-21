package org.cbio.peralyzer.controller;

import org.cbio.peralyzer.service.NetworkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/network")
public class NetworkController
{
	@Autowired
	NetworkService networkService;

	public NetworkService getNetworkService()
	{
		return networkService;
	}
	public void setNetworkService(NetworkService networkService)
	{
		this.networkService = networkService;
	}

}
